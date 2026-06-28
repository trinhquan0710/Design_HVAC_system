# Design_HVAC_system

Hệ thống giám sát và điều khiển HVAC/IAQ theo kiến trúc Edge-to-Central: ESP32 đọc cảm biến thật, server Raspberry Pi xử lý MQTT + rule-based control, dashboard React hiển thị telemetry thời gian thực.

---

## Kiến trúc hệ thống

```
ESP32 (SCD30 + PMS7003 + LCD 1602 + WS2812B)
        │  MQTT  topic: sensor/indoor
        ▼
Mosquitto Broker
        │
        ▼
mqtt-subscriber (Python / ThreadingHTTPServer)
  ├── Lưu TimescaleDB
  ├── REST API :5000
  └── ZoneManager (Rule-Based Control)
        │  MQTT  topic: remote-control/{device_id}
        ▼
ESP32 nhận lệnh điều khiển
        
Dashboard React (Vite) ←── /api proxy ──→ REST API
```

---

## Tính năng

- **Giám sát IAQ thời gian thực** — nhiệt độ, độ ẩm, CO₂, PM2.5 từ ESP32.
- **Rule-Based Control** — ZoneManager tự động điều chỉnh theo lịch và điều kiện môi trường.
- **Free Cooling** — khi nhiệt độ ngoài trời thấp hơn trong phòng >1.5°C, bật quạt thông gió thay AC.
- **Manual Override** — người dùng điều chỉnh tay, Zone Manager tạm dừng 15 phút.
- **Dashboard 3 tab** — Tổng quan / Tòa nhà / Điện năng.

---

## Logic điều khiển tự động (Rule-Based)

| Policy | Thời gian | Setpoint nhiệt độ | CO₂ Max | Quạt |
|---|---|---|---|---|
| `working_hours` | 8:00 – 22:00 | 24.5°C | 700 ppm | auto |
| `night_eco` | 22:00 – 8:00 | 26.5°C | 950 ppm | low |
| `free_cooling` | bất kỳ | — | — | on (thông gió) |

---

## Phần cứng

| Thiết bị | Giao tiếp | GPIO |
|---|---|---|
| ESP32-S3-N16R8 | — | — |
| SCD30 (CO₂ / nhiệt / ẩm) | I²C (Wire1) | SDA=8, SCL=9 |
| PMS7003 (PM2.5) | UART | RX=16, TX=17 |
| LCD 1602 I²C | I²C (Wire) | SDA=10, SCL=11 |
| WS2812B (LED onboard) | — | GPIO 48 |

Sơ đồ kết nối: [`docs/hardware_design_guide.md`](docs/hardware_design_guide.md)

---

## Cấu trúc thư mục

```
esp32/HVAC_Sensor_Node/     Firmware Arduino + thư viện local (src/)
server/mqtt-subscriber/     subscriber.py — MQTT, TimescaleDB, REST API, ZoneManager
src/                        Frontend React (Vite + TypeScript)
docs/                       Tài liệu bổ sung
mosquitto/config/           Cấu hình MQTT broker
docker-compose.yml          Stack local  — Dashboard :3000, MQTT :1883
docker-compose.alt.yml      Stack VPS    — Dashboard :3005, MQTT :1885
nginx.conf                  Proxy /api → Python server, static → React build
```

---

## Chạy nhanh

### Server (Docker)

```bash
git clone https://github.com/trinhquan0710/Design_HVAC_system.git
cd Design_HVAC_system
docker compose up -d --build
```

Dashboard: http://localhost:3000 — MQTT broker: port 1883.

Chạy song song (tránh trùng cổng):

```bash
docker compose -p hvac -f docker-compose.alt.yml up -d --build
# Dashboard: :3005 — MQTT: :1885
```

### Firmware ESP32

Sửa đầu file `esp32/HVAC_Sensor_Node/HVAC_Sensor_Node.ino`:

```cpp
#define WIFI_SSID        "TenMangWiFi"
#define WIFI_PASSWORD    "MatKhauWiFi"
#define MQTT_SERVER      "192.168.1.100"   // IP của server
#define MQTT_PORT        1883
#define MQTT_DEVICE_ID   "indoor-01"
```

Nạp bằng Arduino IDE, chọn board **ESP32S3 Dev Module**. Thư viện đã có sẵn trong `src/`.

### Frontend (dev mode)

```bash
npm install
npm run dev
# http://localhost:5173
```

---

## MQTT Topics

| Topic | Hướng | Payload chính |
|---|---|---|
| `sensor/indoor` | ESP32 → Server | `temp`, `humidity`, `co2`, `dust`, `device_id` |
| `remote-control/{device_id}` | Server → ESP32 | `power`, `temp`, `operation_mode`, `fan_power`, `co2_max`, `humidity_max` |

---

## Database

TimescaleDB (PostgreSQL). Credentials mặc định trong docker: `iotdb` / `admin` / `admin123`.  
**Đổi mật khẩu trước khi deploy lên môi trường thật.**

---

## Troubleshoot

- **Dashboard không có data** — kiểm tra IP/port MQTT, xem ESP32 đã kết nối WiFi chưa.
- **Zone Manager không gửi lệnh** — xem log `docker logs mqtt-subscriber`, kiểm tra MQTT topic.
- **SCD30 không đọc được** — cần warmup ~30 giây sau khi cấp nguồn.

---

## License

MIT