import { useState, useEffect, useRef, useCallback } from 'react'

const WS_BASE = 'wss://0eg8pswhbg.execute-api.ap-south-1.amazonaws.com/dev'
const MAX_RETRIES = 5

export function useChat(token, groupId = 'default') {
  const [messages, setMessages] = useState([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const retryCountRef = useRef(0)
  const retryTimerRef = useRef(null)
  const wsRef = useRef(null)

  const connect = useCallback(() => {
    if (!token) {
      setError('No auth token available. Please log in again.')
      return
    }

    const url = `${WS_BASE}?token=${encodeURIComponent(token)}&groupId=${encodeURIComponent(groupId)}`
    let ws

    try {
      ws = new WebSocket(url)
    } catch (e) {
      setError(`Failed to create WebSocket: ${e.message}`)
      return
    }

    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      setError(null)
      retryCountRef.current = 0
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'message') {
          setMessages((prev) => [...prev, data.message])
        }

        if (data.type === 'history') {
          setMessages(data.messages || [])
        }

        if (data.type === 'error') {
          setError(data.error || 'Server error')
        }
      } catch {
        // ignore parse errors
      }
    }

    ws.onerror = () => {
      if (!wsRef.current || wsRef.current !== ws) return // stale — was intentionally replaced
      setError('WebSocket connection error — cannot reach chat server')
    }

    ws.onclose = (event) => {
      if (!wsRef.current || wsRef.current !== ws) return // stale — was intentionally replaced
      setConnected(false)
      if (event.code === 1006) {
        setError('Connection dropped — server may be down or token invalid')
      } else if (event.code === 4001 || event.code === 401) {
        setError('Invalid or expired token. Please log in again.')
      }

      if (retryCountRef.current < MAX_RETRIES && event.code !== 4001 && event.code !== 401) {
        const delay = Math.min(1000 * 2 ** retryCountRef.current, 15000)
        retryCountRef.current += 1
        retryTimerRef.current = setTimeout(connect, delay)
      }
    }
  }, [token, groupId])

  useEffect(() => {
    connect()
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
      if (wsRef.current) {
        wsRef.current.onopen = null
        wsRef.current.onclose = null
        wsRef.current.onerror = null
        wsRef.current.onmessage = null
        if (wsRef.current.readyState !== WebSocket.CONNECTING) wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connect])

  const sendMessage = useCallback((content) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'sendMessage', content }))
    }
  }, [])

  const fetchHistory = useCallback(() => {
    sendMessage('__fetch_history__')
  }, [sendMessage])

  const reconnect = useCallback(() => {
    retryCountRef.current = 0
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
    if (wsRef.current) {
      wsRef.current.onopen = null
      wsRef.current.onclose = null
      wsRef.current.onerror = null
      wsRef.current.onmessage = null
      if (wsRef.current.readyState !== WebSocket.CONNECTING) wsRef.current.close()
      wsRef.current = null
    }
    connect()
  }, [connect])

  return { messages, sendMessage, fetchHistory, connected, error, reconnect }
}
