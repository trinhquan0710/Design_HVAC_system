import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Building2, Thermometer, Wind, Droplets, Activity,
} from 'lucide-react';
import { BuildingInfo, HVACState } from '../types';
import { cn } from '../lib/utils';

interface BuildingVisualizationProps {
  building?: BuildingInfo;
  temperature?: number | null;
  control?: Pick<HVACState, 'power' | 'mode' | 'fanSpeed' | 'targetTemp'> | null;
}

function tempColor(t: number | null | undefined): string {
  if (t == null) return '#38bdf8';
  if (t < 22) return '#60a5fa';
  if (t <= 24.5) return '#34d399';
  if (t <= 28) return '#fbbf24';
  return '#f87171';
}

export const BuildingVisualization: React.FC<BuildingVisualizationProps> = ({
  building,
  temperature,
  control,
}) => {
  const zoneTemp = temperature;
  const fanOn = control?.power && control?.fanSpeed !== 'off';
  const chillerOn = control?.power && (control?.mode === 'cool' || control?.mode === 'auto');
  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 20;
  const sunX = 120 + (hour / 24) * 560;

  const airflowIntensity = fanOn ? 0.7 : 0;

  const Metric = ({ icon: Icon, label, value, unit, color }: {
    icon: React.ElementType; label: string; value: string; unit?: string; color?: string;
  }) => (
    <div className="rounded-xl bg-slate-950/70 border border-slate-800/90 p-3 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase text-slate-500 tracking-wider mb-1">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <p className={cn('text-lg font-black font-mono leading-none', color ?? 'text-white')}>
        {value}
        {unit && <span className="text-[10px] text-slate-500 ml-1 font-bold">{unit}</span>}
      </p>
    </div>
  );

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/85 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-950/40">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            Tòa nhà — Zone A
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            {building?.zone_id ?? 'Phòng làm việc'} • {building?.volume_m3?.toFixed(0) ?? 273} m³ • {building?.floor ?? 'Tầng 12'}
          </p>
        </div>
        <span className={cn(
          'text-[8px] font-black uppercase px-2.5 py-1 rounded-full border',
          building?.sensor_online
            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            : 'bg-slate-800 text-slate-500 border-slate-700'
        )}>
          {building?.sensor_online ? 'Live' : 'Offline'}
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-0">
        <div className="xl:col-span-8 relative min-h-[380px] bg-[#060a12]">
          <svg viewBox="0 0 720 400" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isDay ? '#0c1929' : '#050510'} />
                <stop offset="100%" stopColor="#060a12" />
              </linearGradient>
              <linearGradient id="floorGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#334155" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#1e293b" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="wallLeft" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={tempColor(zoneTemp)} stopOpacity="0.35" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="wallRight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={tempColor(zoneTemp)} stopOpacity="0.2" />
                <stop offset="100%" stopColor="#1e293b" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="roofGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#475569" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#1e293b" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <marker id="arrowBlue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#38bdf8" />
              </marker>
            </defs>

            <rect width="720" height="400" fill="url(#skyGrad)" />

            {[...Array(12)].map((_, i) => (
              <line key={`g${i}`} x1={60 + i * 55} y1="320" x2={180 + i * 55} y2="400" stroke="#1e293b" strokeWidth="0.5" opacity="0.6" />
            ))}

            {isDay ? (
              <circle cx={sunX} cy="55" r="28" fill="#fbbf24" fillOpacity="0.15" filter="url(#glow)" />
            ) : (
              <circle cx="600" cy="50" r="18" fill="#94a3b8" fillOpacity="0.2" />
            )}
            {isDay && <circle cx={sunX} cy="55" r="14" fill="#fcd34d" fillOpacity="0.9" />}

            {/* AHU quạt */}
            <g transform="translate(88, 185)">
              <path d="M0,40 L30,25 L30,85 L0,100 Z" fill={fanOn ? '#1e3a5f' : '#1e293b'} stroke={fanOn ? '#3b82f6' : '#475569'} strokeWidth="1.2" />
              <path d="M30,25 L70,5 L70,65 L30,85 Z" fill={fanOn ? '#0f2744' : '#0f172a'} stroke={fanOn ? '#2563eb' : '#334155'} strokeWidth="1.2" />
              <path d="M0,40 L30,25 L70,5 L40,20 Z" fill="#334155" stroke={fanOn ? '#60a5fa' : '#475569'} strokeWidth="1" />
              <text x="18" y="58" fill={fanOn ? '#93c5fd' : '#64748b'} fontSize="7" fontWeight="bold">QUẠT</text>
              <text x="14" y="70" fill={fanOn ? '#60a5fa' : '#475569'} fontSize="6" fontWeight="bold">CẤP GIÓ</text>
              <g transform="translate(50, 35)">
                {fanOn ? (
                  <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    style={{ transformOrigin: '0px 0px' }}
                  >
                    {[0, 72, 144, 216, 288].map((deg) => (
                      <line key={deg} x1="0" y1="0" x2="0" y2="-10" stroke="#38bdf8" strokeWidth="2" transform={`rotate(${deg})`} />
                    ))}
                  </motion.g>
                ) : (
                  <circle r="8" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
                )}
              </g>
              <rect x="2" y="2" width="28" height="12" rx="3" fill={fanOn ? '#10b981' : '#334155'} fillOpacity="0.9" />
              <text x="16" y="11" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">{fanOn ? 'BẬT' : 'TẮT'}</text>
            </g>

            {/* Walls */}
            <path d="M255 155 L255 295 L400 365 L400 225 Z" fill="url(#wallLeft)" stroke={tempColor(zoneTemp)} strokeWidth="1.2" strokeOpacity="0.6" />
            <path d="M400 225 L400 365 L580 285 L580 145 Z" fill="url(#wallRight)" stroke="#475569" strokeWidth="1" strokeOpacity="0.5" />
            <path d="M255 295 L400 365 L580 285 L435 215 Z" fill="url(#floorGrad)" stroke="#334155" strokeWidth="0.8" />
            <path d="M255 155 L400 225 L580 145 L435 75 Z" fill="url(#roofGrad)" stroke="#64748b" strokeWidth="0.8" strokeOpacity="0.6" />

            <text x="400" y="200" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="bold" letterSpacing="1">ZONE A</text>
            <text x="400" y="216" textAnchor="middle" fill="#64748b" fontSize="8">PHÒNG LÀM VIỆC</text>

            <text x="400" y="255" textAnchor="middle" fill={tempColor(zoneTemp)} fontSize="28" fontWeight="bold" fontFamily="monospace" filter="url(#glow)">
              {zoneTemp?.toFixed(1) ?? '—'}°
            </text>

            {/* Occupant */}
            <g transform="translate(340, 300)" opacity="0.7">
              <rect x="0" y="0" width="40" height="8" rx="2" fill="#475569" />
              <circle cx="20" cy="-12" r="7" fill="#fbbf24" fillOpacity="0.7" />
              <rect x="14" y="-5" width="12" height="14" rx="3" fill="#fbbf24" fillOpacity="0.5" />
            </g>

            {fanOn && (
              <motion.path
                d="M 258 258 L 330 295"
                stroke="#38bdf8"
                strokeWidth={2 + airflowIntensity}
                fill="none"
                markerEnd="url(#arrowBlue)"
                strokeDasharray="4 4"
                animate={{ strokeDashoffset: [0, -16] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                opacity={0.8}
              />
            )}

            {/* Chiller */}
            <g transform="translate(588, 205)">
              <rect x="0" y="0" width="58" height="72" rx="5" fill={chillerOn ? '#1e1b4b' : '#0f172a'} stroke={chillerOn ? '#6366f1' : '#334155'} strokeWidth="1.5" />
              <text x="29" y="16" textAnchor="middle" fill={chillerOn ? '#a5b4fc' : '#64748b'} fontSize="7" fontWeight="bold">ĐIỀU HÒA</text>
              <g transform="translate(29, 32)">
                <circle r="10" fill={chillerOn ? '#4f46e5' : '#1e293b'} fillOpacity="0.5" />
                <text x="0" y="4" textAnchor="middle" fill={chillerOn ? '#c7d2fe' : '#475569'} fontSize="12">❄</text>
              </g>
              <text x="29" y="54" textAnchor="middle" fill={chillerOn ? '#818cf8' : '#475569'} fontSize="10" fontFamily="monospace" fontWeight="bold">
                {control?.targetTemp != null ? `${control.targetTemp}°C` : '—'}
              </text>
              <text x="29" y="66" textAnchor="middle" fill="#64748b" fontSize="6">setpoint</text>
              <rect x="8" y="4" width="24" height="11" rx="3" fill={chillerOn ? '#4f46e5' : '#334155'} />
              <text x="20" y="12" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold">{chillerOn ? 'BẬT' : 'TẮT'}</text>
            </g>

            {/* Setpoint HUD */}
            <text x="80" y="100" fill="#64748b" fontSize="9" fontWeight="bold" letterSpacing="2">SETPOINT</text>
            <text x="80" y="118" fill="#38bdf8" fontSize="14" fontWeight="bold" fontFamily="monospace">
              {control?.targetTemp ?? '—'}°C
            </text>
            <text x="80" y="134" fill="#64748b" fontSize="8">
              Mode: {control?.mode ?? '—'} • Fan: {control?.fanSpeed ?? '—'}
            </text>
          </svg>

          <div className="absolute top-3 left-3">
            <span className={cn(
              'text-[8px] font-black uppercase px-2 py-1 rounded-md border',
              chillerOn
                ? 'bg-indigo-950/90 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-950/80 border-slate-700 text-slate-400'
            )}>
              {chillerOn ? `Làm mát → ${control?.targetTemp}°C` : 'HVAC tắt'}
            </span>
          </div>
        </div>

        {/* Side metrics */}
        <div className="xl:col-span-4 p-4 bg-slate-950/30 border-t xl:border-t-0 xl:border-l border-slate-800/80 space-y-4">
          <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Điều khiển hiện tại</p>
          <div className="grid grid-cols-2 gap-2">
            <Metric icon={Thermometer} label="Nhiệt độ" value={zoneTemp?.toFixed(1) ?? '—'} unit="°C" color="text-sky-400" />
            <Metric icon={Thermometer} label="Setpoint" value={control?.targetTemp?.toFixed(1) ?? '—'} unit="°C" color="text-blue-400" />
            <Metric icon={Wind} label="Quạt" value={control?.fanSpeed ?? '—'} color={fanOn ? 'text-emerald-400' : 'text-slate-400'} />
            <Metric icon={Activity} label="Mode" value={control?.mode ?? '—'} color="text-violet-400" />
          </div>
          <div className="rounded-xl bg-slate-950/70 border border-slate-800/90 p-3">
            <p className="text-[8px] font-bold uppercase text-slate-500 mb-2">Trạng thái thiết bị</p>
            <div className="space-y-2">
              {[
                { label: 'Quạt cấp gió', on: fanOn },
                { label: 'Điều hòa / Chiller', on: chillerOn },
                { label: 'Nguồn điện HVAC', on: control?.power },
              ].map(d => (
                <div key={d.label} className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-400">{d.label}</span>
                  <span className={cn(
                    'text-[8px] font-black uppercase px-2 py-0.5 rounded-full',
                    d.on ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-500'
                  )}>
                    {d.on ? 'BẬT' : 'TẮT'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
