'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DashboardSnapshot } from '@/services/dashboard'

export function ReviewsChart({ data }: { data: DashboardSnapshot['reviewSeries'] }) {
  return (
    <div className="h-[230px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -16 }}>
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
            cursor={{ stroke: '#2b4b39', strokeDasharray: '4 4' }}
            contentStyle={{
              background: '#122219',
              border: '1px solid #2b4b39',
              borderRadius: 12,
              color: '#f2f5f3',
              fontSize: 12,
              boxShadow: '0 20px 40px -20px rgba(0,0,0,.9)',
            }}
            labelStyle={{ color: '#90a79b', fontSize: 11, marginBottom: 4 }}
            itemStyle={{ color: '#6ee7b7' }}
          />
          <Line
            type="monotone"
            dataKey="reviews"
            name="Reviews"
            stroke="#10b981"
            strokeWidth={2.25}
            dot={false}
            activeDot={{ r: 4, fill: '#10b981', stroke: '#07110d', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
