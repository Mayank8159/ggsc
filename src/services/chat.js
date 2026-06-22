import { useState, useEffect, useRef, useCallback } from 'react'

const WS_BASE = 'wss://0eg8pswhbg.execute-api.ap-south-1.amazonaws.com/dev'

export function useChat(token, groupId = 'default') {
  const [messages, setMessages] = useState([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const [retry, setRetry] = useState(0)
  const wsRef = useRef(null)

  const reconnect = useCallback(() => setRetry((r) => r + 1), [])

  useEffect(() => {
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
      setError('WebSocket connection error — cannot reach chat server')
    }

    ws.onclose = (event) => {
      setConnected(false)
      if (event.code === 1006) {
        setError('Connection dropped — server may be down or token invalid')
      } else if (event.code === 4001 || event.code === 401) {
        setError('Invalid or expired token. Please log in again.')
      }
    }

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [token, groupId, retry])

  const sendMessage = useCallback((content) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'sendMessage', content }))
    }
  }, [])

  const fetchHistory = useCallback(() => {
    sendMessage('__fetch_history__')
  }, [sendMessage])

  return { messages, sendMessage, fetchHistory, connected, error, reconnect }
}
