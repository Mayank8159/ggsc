import { useState, useEffect, useRef, useCallback } from 'react'

const WS_BASE = 'wss://0eg8pswhbg.execute-api.ap-south-1.amazonaws.com/dev'

export function useChat(token, groupId = 'default') {
  const [messages, setMessages] = useState([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const wsRef = useRef(null)

  useEffect(() => {
    if (!token) return

    const url = `${WS_BASE}?token=${encodeURIComponent(token)}&groupId=${encodeURIComponent(groupId)}`
    const ws = new WebSocket(url)
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
      } catch {
        // ignore parse errors
      }
    }

    ws.onerror = () => {
      setError('WebSocket connection error')
    }

    ws.onclose = () => {
      setConnected(false)
    }

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [token, groupId])

  const sendMessage = useCallback((content) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'sendMessage', content }))
    }
  }, [])

  const fetchHistory = useCallback(() => {
    sendMessage('__fetch_history__')
  }, [sendMessage])

  return { messages, sendMessage, fetchHistory, connected, error }
}
