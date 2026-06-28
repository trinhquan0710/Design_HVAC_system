# Project Summary — Design_HVAC_system

## Mô tả

Hệ thống HVAC điều khiển tập trung theo kiến trúc rule-based: ESP32 → MQTT → Server → Dashboard.

---

## Cấu trúc file

### `esp32/HVAC_Sensor_Node/`
- `HVAC_Sensor_Node.ino` — Firmware chính: đọc SCD30, PMS5003, hiển thị LCD, publish MQTT, nhận lệnh remote-control.
- `src/LiquidCrystal_I2C/` — Thư viện LCD I2C local.
- `src/PubSubClient/` — Thư viện MQTT local.
- `src/SparkFun_SCD30/` — Thư viện cảm biến CO2/nhiệt/ẩm.

### `server/mqtt-subscriber/`
- `subscriber.py` — MQTT subscriber, lưu TimescaleDB, REST API `/api/telemetry` và `/api/remote-control`, ZoneManager rule-based.
- `requirements.txt` — paho-mqtt, psycopg2-binary, python-dotenv.
- `Dockerfile` — Container Python.

### `src/` (Frontend React + Vite)
- `App.tsx` — Entry point, 3 tab: Tổng quan / Tòa nhà / Điện năng.
- `components/MetricCard.tsx` — Card hiển thị chỉ số cảm biến.
- `components/SensorHistoryChart.tsx` — Biểu đồ lịch sử cảm biến.
- `components/ControlPanel.tsx` — Panel điều khiển AC (nhiệt độ, quạt, mode).
- `components/BuildingVisualization.tsx` — Trực quan hóa tòa nhà.
- `components/HVACEquipmentPanel.tsx` — Trạng thái thiết bị HVAC.
- `components/DevicePowerPanel.tsx` — Cấu hình và theo dõi điện năng.
- `components/EnergyBreakdownChart.tsx` — Biểu đồ phân tích điện năng.
- `types.ts` — TypeScript types.

### `docs/`
- `hardware_design_guide.md` — Hướng dẫn thiết kế PCB và kết nối phần cứng.

### Cấu hình hạ tầng
- `docker-compose.yml` — Stack local: TimescaleDB, Mosquitto, mqtt-subscriber, Nginx frontend.
- `docker-compose.alt.yml` — Stack VPS / chạy song song cổng khác.
- `mosquitto/config/mosquitto.conf` — Cấu hình MQTT broker.
- `nginx.conf` — Proxy `/api` → server Python, static → React build.
