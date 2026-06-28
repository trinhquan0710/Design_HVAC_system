import React from 'react';
import { motion } from 'motion/react';
import { Snowflake, Fan, Wind, AirVent, Power, ArrowRight, Flame } from 'lucide-react';
import { HVACState } from '../types';
import { cn } from '../lib/utils';

interface HVACEquipmentPanelProps {
  building?: { zone_id?: string };
  hvacState?: Pick<HVACState, 'power' | 'mode' | 'fanSpeed' | 'targetTemp'> | null;
}

interface EquipmentCardProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  on: boolean;
  mode?: string;
  value: string;
  detail?: string;
  colorOn: string;
  colorOff: string;
}

function EquipmentCard({ title, subtitle, icon: Icon, on, mode, value, detail, colorOn, colorOff }: EquipmentCardProps) {
  return (
    <div className={cn('relative rounded-xl border p-3 transition-all', on ? `${colorOn} shadow-lg` : `${colorOff} opacity-80`)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center border', on ? 'bg-white/10 border-white/20' : 'bg-slate-900 border-slate-700')}>
            <Icon className={cn('w-4 h-4', on ? 'text-white' : 'text-slate-500')} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wide text-white">{title}</p>
            <p className="text-[8px] text-slate-400 font-semibold">{subtitle}</p>
          </div>
        </div>
        <span className={cn('flex items-center gap-1 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0', on ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' : 'bg-slate-800 text-slate-500 border-slate-700')}>
          <Power className="w-2.5 h-2.5" />
          {on ? 'BẬT' : 'TẮT'}
        </span>
      </div>
      <p className="text-xl font-black font-mono mt-2 text-white">{value}</p>
      {mode && <p className="text-[9px] font-bold uppercase mt-1 text-slate-300/90">Chế độ: <span className="text-white">{mode}</span></p>}
      {detail && <p className="text-[8px] text-slate-400 mt-1 leading-relaxed">{detail}</p>}
      {on && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400/60 rounded-b-xl"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}
    </div>
  );
}

export const HVACEquipmentPanel: React.FC<HVACEquipmentPanelProps> = ({ building, hvacState }) => {
  const ctrl = hvacState;
  const systemOn = ctrl?.power ?? false;
  const fanOn = systemOn && ctrl?.fanSpeed !== 'off';
  const chillerOn = systemOn && (ctrl?.mode === 'cool' || ctrl?.mode === 'auto');
  const heatOn = systemOn && ctrl?.mode === 'heat';
  const fanSpeedMap: Record<string, number> = { auto: 0.5, on: 0.5, low: 0.22, medium: 0.5, high: 0.8, off: 0 };
  const fanPct = fanOn ? Math.round((fanSpeedMap[ctrl?.fanSpeed ?? 'auto'] ?? 0.5) * 100) : 0;
  
  let acMode = 'Chờ (Standby)';
  if (!systemOn) acMode = 'Hệ thống tắt';
  else if (heatOn) acMode = 'Làm nóng (Heat)';
  else if (chillerOn) acMode = 'Làm mát (Cool)';
  else if (fanOn) acMode = 'Chỉ quạt / thông gió';

  const fanMode = !fanOn ? 'Tắt' : (ctrl?.fanSpeed === 'high' ? 'Cao' : ctrl?.fanSpeed === 'low' ? 'Thấp' : 'Trung bình');

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800/85 shadow-xl space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Thiết bị HVAC — {building?.zone_id ?? 'Zone A'}
        </h4>
        <div className="flex gap-2 text-[8px] font-bold flex-wrap">
          <span className={cn('px-2 py-0.5 rounded-full border', systemOn ? 'bg-emerald-950 border-emerald-700 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-500')}>
            {systemOn ? 'Đang chạy' : 'Tắt'}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400">
            Setpoint: {ctrl?.targetTemp ?? '—'}°C
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1 py-2 px-2 rounded-xl bg-slate-950/50 border border-slate-800 text-[7px] font-bold uppercase text-slate-500">
        <span className="text-sky-400">Ngoài trời</span>
        <ArrowRight className="w-3 h-3 text-slate-600" />
        <span className={cn(fanOn ? 'text-blue-400' : 'text-slate-600')}>Quạt {fanOn ? 'ON' : 'OFF'}</span>
        <ArrowRight className="w-3 h-3 text-slate-600" />
        <span className={cn(chillerOn ? 'text-indigo-400' : 'text-slate-600')}>Chiller {chillerOn ? 'ON' : 'OFF'}</span>
        <ArrowRight className="w-3 h-3 text-slate-600" />
        <span className="text-emerald-400">Phòng Zone A</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <EquipmentCard
          title="Điều hòa / Chiller"
          subtitle={heatOn ? 'Chế độ làm nóng' : 'Làm lạnh nước → gió mát'}
          icon={heatOn ? Flame : Snowflake}
          on={chillerOn || heatOn}
          mode={acMode}
          value={systemOn ? `${ctrl?.targetTemp ?? '—'}°C` : 'TẮT'}
          detail={systemOn ? `Setpoint nhiệt độ phòng` : 'Hệ thống đang tắt'}
          colorOn="bg-indigo-600/25 border-indigo-500/40"
          colorOff="bg-slate-900/80 border-slate-800"
        />
        <EquipmentCard
          title="Quạt cấp gió"
          subtitle="Supply fan — đẩy gió vào phòng"
          icon={Fan}
          on={fanOn}
          mode={fanMode}
          value={`${fanPct}%`}
          detail={`Tốc độ: ${ctrl?.fanSpeed ?? '—'}`}
          colorOn="bg-blue-600/25 border-blue-500/40"
          colorOff="bg-slate-900/80 border-slate-800"
        />
        <EquipmentCard
          title="Thông gió / Van gió"
          subtitle="Hút không khí ngoài trời"
          icon={Wind}
          on={fanOn && (ctrl?.fanSpeed === 'high' || ctrl?.mode === 'fan')}
          mode={ctrl?.mode === 'fan' ? 'Mở rộng' : 'Tự động'}
          value={ctrl?.mode === 'fan' ? '100%' : fanOn ? '50%' : '0%'}
          detail="Damper tự điều chỉnh theo chế độ"
          colorOn="bg-cyan-600/20 border-cyan-500/35"
          colorOff="bg-slate-900/80 border-slate-800"
        />
        <EquipmentCard
          title="Máy lọc không khí"
          subtitle="Purifier — lọc PM₂.₅"
          icon={AirVent}
          on={systemOn && fanOn}
          mode={systemOn && fanOn ? 'Đang lọc' : 'Tắt tiết kiệm điện'}
          value={systemOn && fanOn ? 'ON' : 'OFF'}
          detail="Hoạt động khi quạt bật"
          colorOn="bg-teal-600/20 border-teal-500/35"
          colorOff="bg-slate-900/80 border-slate-800"
        />
      </div>

      <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3">
        <div className="flex justify-between text-[8px] font-bold uppercase text-slate-500 mb-2">
          <span>Tốc độ quạt</span>
          <span className={cn(fanOn ? 'text-blue-400' : 'text-slate-600')}>
            {fanOn ? `${fanPct}% — ${fanMode}` : 'TẮT'}
          </span>
        </div>
        <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full', fanOn ? 'bg-gradient-to-r from-blue-700 to-blue-400' : 'bg-slate-700')}
            animate={{ width: `${fanPct}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>
    </div>
  );
};
