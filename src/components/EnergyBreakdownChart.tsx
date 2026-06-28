import React from 'react';
import { Zap } from 'lucide-react';

interface EnergyBreakdownChartProps {
  sim?: null;
  baselineSim?: null;
}

export const EnergyBreakdownChart: React.FC<EnergyBreakdownChartProps> = () => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800/85 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-yellow-400" />
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Phân rã công suất thiết bị
        </h4>
      </div>
      <div className="space-y-3">
        {[
          { name: 'Điều hòa / Chiller', color: 'bg-indigo-500' },
          { name: 'Quạt cấp gió', color: 'bg-blue-500' },
          { name: 'Bơm nước lạnh', color: 'bg-cyan-500' },
          { name: 'Máy lọc không khí', color: 'bg-teal-500' },
          { name: 'Chiếu sáng', color: 'bg-yellow-500' },
        ].map((d) => (
          <div key={d.name} className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${d.color}`} />
            <span className="text-[9px] text-slate-400 flex-1">{d.name}</span>
            <span className="text-[9px] text-slate-600 font-mono">— W</span>
          </div>
        ))}
      </div>
      <p className="text-[8px] text-slate-600 mt-4 text-center">
        Dữ liệu điện năng sẽ hiển thị khi cảm biến kết nối
      </p>
    </div>
  );
};
