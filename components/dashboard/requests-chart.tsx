'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DashboardSnapshot } from '@/services/dashboard'

export function RequestsChart({ data }: { data: DashboardSnapshot['requestSeries'] }) {
  return (
    <div className="h-[230px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: -22 }} barGap={2}>
          <CartesianGrid stroke="#1c3327" strokeDasharray="3 6" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#6b8377', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={6}
            dy={6}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: '#6b8377', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={34}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            contentStyle={{
              background: '#122219',
              border: '1px solid #2b4b39',
              borderRadius: 12,
              color: '#f2f5f3',
              fontSize: 12,
              boxShadow: '0 20px 40px -20px rgba(0,0,0,.9)',
            }}
            labelStyle={{ color: '#90a79b', fontSize: 11, marginBottom: 4 }}
            itemStyle={{ color: '#f2f5f3' }}
          />
          <Bar dataKey="sent" name="Sent" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={9} />
          <Bar dataKey="delivered" name="Delivered" fill="#6ee7b7" radius={[4, 4, 0, 0]} maxBarSize={9} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
