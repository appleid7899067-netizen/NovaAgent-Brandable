#!/usr/bin/env bash

# กำหนดชื่อไฟล์ PID และ Log
SERVER_PID="typhoon-server.pid"
TUNNEL_PID="cloudflared.pid"
SERVER_LOG="server.log"
TUNNEL_LOG="cloudflared.log"
PORT=9931
MODEL="typhoon-ai/typhoon2.1-gemma3-12b-gguf:Q4_K_M"

# กำหนด API Key (หากไม่มีการ set ใน environment จะใช้ค่าเริ่มต้นนี้)
export NOVA_LLM_API_KEY="${NOVA_LLM_API_KEY:-my-secret-key-1234}"
export PATH="$HOME/.local/bin:$HOME/.llama/bin:$PATH"

start_services() {
  # 1. ตรวจสอบและเปิด Typhoon Server
  if [ -f "$SERVER_PID" ] && kill -0 $(cat "$SERVER_PID") 2>/dev/null; then
    echo "⚠️ Typhoon Server กำลังทำงานอยู่แล้ว (PID: $(cat $SERVER_PID))"
  else
    echo "🚀 กำลังเปิด Typhoon 12B Server..."
    nohup llama serve -hf "$MODEL" \
      --host 0.0.0.0 --port "$PORT" -c 2048 -np 1 \
      -a typhoon-local --api-key "$NOVA_LLM_API_KEY" --no-webui > "$SERVER_LOG" 2>&1 &
    echo $! > "$SERVER_PID"
    
    echo "⏳ รอโมเดล โหลดเข้า Memory..."
    ready=false
    for i in $(seq 1 30); do
      if curl -fsS -H "Authorization: Bearer $NOVA_LLM_API_KEY" "http://127.0.0.1:$PORT/v1/models" >/dev/null 2>&1; then
        ready=true
        break
      fi
      sleep 5
    done

    if [ "$ready" = true ]; then
      echo "✅ Local Server พร้อมใช้งาน!"
    else
      echo "❌ เปิด Server ไม่สำเร็จ ตรวจสอบรายละเอียดใน $SERVER_LOG"
      return 1
    fi
  fi

  # 2. ตรวจสอบและเปิด Cloudflare Tunnel
  if [ -f "$TUNNEL_PID" ] && kill -0 $(cat "$TUNNEL_PID") 2>/dev/null; then
    echo "⚠️ Cloudflare Tunnel กำลังทำงานอยู่แล้ว (PID: $(cat $TUNNEL_PID))"
  else
    echo "🌐 กำลังเปิด Cloudflare Tunnel..."
    nohup cloudflared tunnel --url "http://127.0.0.1:$PORT" --no-autoupdate > "$TUNNEL_LOG" 2>&1 &
    echo $! > "$TUNNEL_PID"

    echo "🔍 กำลังค้นหา Public URL..."
    tunnel_url=""
    for i in $(seq 1 12); do
      tunnel_url=$(grep -Eo 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' "$TUNNEL_LOG" | head -n 1 || true)
      if [ -n "$tunnel_url" ]; then break; fi
      sleep 3
    done

    if [ -n "$tunnel_url" ]; then
      echo "=================================================="
      echo "🎉 ระบบพร้อมใช้งานแล้ว!"
      echo "📌 Base API URL: ${tunnel_url}/v1"
      echo "🔑 API Key:     $NOVA_LLM_API_KEY"
      echo "🤖 Model Name:   typhoon-local"
      echo "=================================================="
    else
      echo "❌ ไม่พบ Public URL ตรวจสอบรายละเอียดใน $TUNNEL_LOG"
    fi
  fi
}

stop_services() {
  echo "🛑 กำลังปิดบริการทั้งหมด..."
  
  if [ -f "$TUNNEL_PID" ]; then
    PID=$(cat "$TUNNEL_PID")
    if kill -0 "$PID" 2>/dev/null; then
      kill "$PID"
      echo "  - ปิด Cloudflare Tunnel (PID: $PID) เรียบร้อย"
    fi
    rm -f "$TUNNEL_PID"
  fi

  if [ -f "$SERVER_PID" ]; then
    PID=$(cat "$SERVER_PID")
    if kill -0 "$PID" 2>/dev/null; then
      kill "$PID"
      echo "  - ปิด Typhoon Server (PID: $PID) เรียบร้อย"
    fi
    rm -f "$SERVER_PID"
  fi

  echo "✅ ปิดบริการทั้งหมดเรียบร้อยแล้ว"
}

status_services() {
  echo "📊 สถานะระบบปัจจุบัน:"
  if [ -f "$SERVER_PID" ] && kill -0 $(cat "$SERVER_PID") 2>/dev/null; then
    echo "  - Typhoon Server: 🟢 RUNNING (PID: $(cat $SERVER_PID))"
  else
    echo "  - Typhoon Server: 🔴 STOPPED"
  fi

  if [ -f "$TUNNEL_PID" ] && kill -0 $(cat "$TUNNEL_PID") 2>/dev/null; then
    echo "  - Cloudflare Tunnel: 🟢 RUNNING (PID: $(cat $TUNNEL_PID))"
    url=$(grep -Eo 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' "$TUNNEL_LOG" | head -n 1 || true)
    [ -n "$url" ] && echo "  - Public URL: ${url}/v1"
  else
    echo "  - Cloudflare Tunnel: 🔴 STOPPED"
  fi
}

case "$1" in
  start)
    start_services
    ;;
  stop)
    stop_services
    ;;
  status)
    status_services
    ;;
  restart)
    stop_services
    sleep 2
    start_services
    ;;
  *)
    echo "วิธีใช้งาน: $0 {start|stop|status|restart}"
    exit 1
    ;;
esac
