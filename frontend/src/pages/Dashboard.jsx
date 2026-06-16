import { useState } from 'react'
import Papa from 'papaparse'
import ExportButtons from '../components/ExportButtons'
import SmartAlerts from '../components/SmartAlerts'
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

const card = { background: '#1a1f2e', border: '1px solid #2d3748', borderRadius: '12px', padding: '1.25rem' }
const tooltipStyle = { background: '#1a1f2e', border: '1px solid #2d3748', borderRadius: '8px', fontSize: '12px' }

const defaultData = [
    { revenue: 2999, category: 'Electronics', city: 'Delhi', date: '2023-05-21', product: 'Wireless Headphones', quantity: 1, unit_price: 2999 },
    { revenue: 14995, category: 'Electronics', city: 'Chennai', date: '2023-02-14', product: 'Wireless Headphones', quantity: 5, unit_price: 2999 },
    { revenue: 10497, category: 'Appliances', city: 'Chennai', date: '2023-08-15', product: 'Coffee Maker', quantity: 3, unit_price: 3499 },
    { revenue: 1598, category: 'Fitness', city: 'Delhi', date: '2023-03-10', product: 'Yoga Mat', quantity: 2, unit_price: 799 },
    { revenue: 3499, category: 'Appliances', city: 'Bangalore', date: '2023-07-22', product: 'Coffee Maker', quantity: 1, unit_price: 3499 },
    { revenue: 5998, category: 'Electronics', city: 'Delhi', date: '2023-10-18', product: 'Wireless Headphones', quantity: 2, unit_price: 2999 },
    { revenue: 5997, category: 'Footwear', city: 'Chennai', date: '2023-01-12', product: 'Running Shoes', quantity: 3, unit_price: 1999 },
    { revenue: 13996, category: 'Appliances', city: 'Delhi', date: '2023-06-30', product: 'Coffee Maker', quantity: 4, unit_price: 3499 },
    { revenue: 3995, category: 'Fitness', city: 'Jaipur', date: '2023-08-08', product: 'Yoga Mat', quantity: 5, unit_price: 799 },
    { revenue: 8997, category: 'Electronics', city: 'Bangalore', date: '2023-12-01', product: 'Wireless Headphones', quantity: 3, unit_price: 2999 },
    { revenue: 6998, category: 'Appliances', city: 'Mumbai', date: '2023-05-17', product: 'Coffee Maker', quantity: 2, unit_price: 3499 },
    { revenue: 3998, category: 'Footwear', city: 'Bangalore', date: '2023-11-11', product: 'Running Shoes', quantity: 2, unit_price: 1999 },
    { revenue: 7996, category: 'Footwear', city: 'Mumbai', date: '2023-10-29', product: 'Running Shoes', quantity: 4, unit_price: 1999 },
    { revenue: 598, category: 'Stationery', city: 'Jaipur', date: '2023-11-29', product: 'Notebook Set', quantity: 2, unit_price: 299 },
    { revenue: 897, category: 'Stationery', city: 'Mumbai', date: '2023-09-05', product: 'Notebook Set', quantity: 3, unit_price: 299 },
    { revenue: 2999, category: 'Electronics', city: 'Mumbai', date: '2023-10-03', product: 'Wireless Headphones', quantity: 1, unit_price: 2999 },
    { revenue: 1999, category: 'Footwear', city: 'Delhi', date: '2023-04-15', product: 'Running Shoes', quantity: 1, unit_price: 1999 },
    { revenue: 3499, category: 'Appliances', city: 'Jaipur', date: '2023-02-28', product: 'Coffee Maker', quantity: 1, unit_price: 3499 },
    { revenue: 3196, category: 'Fitness', city: 'Chennai', date: '2023-07-14', product: 'Yoga Mat', quantity: 4, unit_price: 799 },
    { revenue: 1495, category: 'Stationery', city: 'Delhi', date: '2023-09-25', product: 'Notebook Set', quantity: 5, unit_price: 299 },
]

function fmtRev(n) {
    if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L'
    if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K'
    return '₹' + Math.round(n)
}



// ── AI Prediction Engine ──────────────────────────────────
function generatePredictions(data) {
    const monthRevenue = {}
    data.forEach(r => {
        const m = parseInt((r.date || '').split('-')[1])
        if (m) monthRevenue[m] = (monthRevenue[m] || 0) + r.revenue
    })
    const months = Object.values(monthRevenue)
    const avg = months.reduce((a, b) => a + b, 0) / (months.length || 1)
    const trend = months.length > 1 ? (months[months.length - 1] - months[0]) / months.length : 0

    const catRevenue = {}
    data.forEach(r => { catRevenue[r.category] = (catRevenue[r.category] || 0) + r.revenue })
    const topCat = Object.entries(catRevenue).sort((a, b) => b[1] - a[1])[0]
    const lowCat = Object.entries(catRevenue).sort((a, b) => a[1] - b[1])[0]

    const cityRevenue = {}
    data.forEach(r => { cityRevenue[r.city] = (cityRevenue[r.city] || 0) + r.revenue })
    const topCity = Object.entries(cityRevenue).sort((a, b) => b[1] - a[1])[0]

    const nextMonthPred = Math.round(avg + trend)
    const growth = trend > 0 ? '+' + Math.round((trend / avg) * 100) + '%' : Math.round((trend / avg) * 100) + '%'

    return {
        nextMonthRevenue: nextMonthPred,
        growthTrend: growth,
        topCategory: topCat?.[0] || 'N/A',
        topCategoryRevenue: topCat?.[1] || 0,
        lowCategory: lowCat?.[0] || 'N/A',
        topCity: topCity?.[0] || 'N/A',
        recommendation: trend > 0
            ? `📈 Revenue is growing! Focus more on ${topCat?.[0]} in ${topCity?.[0]} for maximum returns.`
            : `📉 Revenue is declining. Consider promotions in ${lowCat?.[0]} category to boost sales.`,
        forecastData: MONTHS.map((m, i) => ({
            name: m,
            actual: monthRevenue[i + 1] || 0,
            predicted: Math.max(0, Math.round(avg + trend * (i - months.length / 2)))
        }))
    }
}

// ── Compare Engine ───────────────────────────────────────
function compareProducts(data, p1, p2) {
    const d1 = data.filter(r => r.product === p1)
    const d2 = data.filter(r => r.product === p2)
    const rev1 = d1.reduce((s, r) => s + r.revenue, 0)
    const rev2 = d2.reduce((s, r) => s + r.revenue, 0)
    const qty1 = d1.reduce((s, r) => s + (r.quantity || 0), 0)
    const qty2 = d2.reduce((s, r) => s + (r.quantity || 0), 0)
    const cities1 = [...new Set(d1.map(r => r.city))].length
    const cities2 = [...new Set(d2.map(r => r.city))].length
    return {
        radar: [
            { metric: 'Revenue', [p1]: Math.round(rev1 / 1000), [p2]: Math.round(rev2 / 1000) },
            { metric: 'Orders', [p1]: d1.length, [p2]: d2.length },
            { metric: 'Qty Sold', [p1]: qty1, [p2]: qty2 },
            { metric: 'Cities', [p1]: cities1, [p2]: cities2 },
            { metric: 'Avg Value', [p1]: d1.length ? Math.round(rev1 / d1.length / 100) : 0, [p2]: d2.length ? Math.round(rev2 / d2.length / 100) : 0 },
        ],
        stats: {
            [p1]: { revenue: rev1, orders: d1.length, qty: qty1, avg: d1.length ? Math.round(rev1 / d1.length) : 0, cities: cities1 },
            [p2]: { revenue: rev2, orders: d2.length, qty: qty2, avg: d2.length ? Math.round(rev2 / d2.length) : 0, cities: cities2 },
        },
        winner: rev1 > rev2 ? p1 : p2
    }
}

export default function Dashboard({ user, onLogout }) {
    const [data, setData] = useState(defaultData)
    const [section, setSection] = useState('dashboard')
    const [catFilter, setCatFilter] = useState('')
    const [cityFilter, setCityFilter] = useState('')
    const [monthFilter, setMonthFilter] = useState('')
    const [fileName, setFileName] = useState('Sample data')
    const [page, setPage] = useState(1)
    const [compareP1, setCompareP1] = useState('')
    const [compareP2, setCompareP2] = useState('')
    const [aiLoading, setAiLoading] = useState(false)
    const [aiResult, setAiResult] = useState(null)
    const [helpOpen, setHelpOpen] = useState(false)
    const rowsPerPage = 12

    function handleFile(e) {
        const file = e.target.files[0]
        if (!file) return
        Papa.parse(file, {
            header: true, skipEmptyLines: true,
            complete(res) {
                const cols = res.meta.fields

                // Revenue column find karo
                const revCol = cols.find(c => c.toLowerCase() === 'revenue') ||
                    cols.find(c => ['revenue', 'amount', 'sales', 'total'].some(k => c.toLowerCase().includes(k))) || cols[0]

                // Category column
                const catCol = cols.find(c => c.toLowerCase() === 'category') ||
                    cols.find(c => c.toLowerCase().includes('category'))

                // City column  
                const cityCol = cols.find(c => c.toLowerCase() === 'city') ||
                    cols.find(c => c.toLowerCase().includes('city'))

                // Date column
                const dateCol = cols.find(c => c.toLowerCase() === 'order_date') ||
                    cols.find(c => c.toLowerCase().includes('date'))

                // Quantity column
                const qtyCol = cols.find(c => c.toLowerCase() === 'quantity') ||
                    cols.find(c => c.toLowerCase().includes('quantity'))

                // Product column
                const prodCol = cols.find(c => c.toLowerCase() === 'product_name') ||
                    cols.find(c => c.toLowerCase().includes('product'))

                const mapped = res.data.map(r => ({
                    revenue: Math.abs(parseFloat(r[revCol]) || 0),
                    category: catCol ? String(r[catCol]) : 'Unknown',
                    city: cityCol ? String(r[cityCol]) : 'Unknown',
                    date: dateCol ? String(r[dateCol]) : '',
                    product: prodCol ? String(r[prodCol]) : 'Unknown',
                    quantity: qtyCol ? Math.abs(parseInt(r[qtyCol]) || 0) : 0,
                })).filter(r => r.revenue > 0 && r.revenue < 1e12)

                setData(mapped)
                setFileName(file.name)
                setSection('dashboard')
                setAiResult(null)
            }
        })
    }

    function runAIPrediction() {
        setAiLoading(true)
        setAiResult(null)
        setTimeout(() => {
            setAiResult(generatePredictions(data))
            setAiLoading(false)
        }, 1500)
    }

    const filtered = data.filter(r => {
        if (catFilter && r.category !== catFilter) return false
        if (cityFilter && r.city !== cityFilter) return false
        if (monthFilter) {
            const m = parseInt((r.date || '').split('-')[1])
            if (m !== parseInt(monthFilter)) return false
        }
        return true
    })

    const totalRev = filtered.reduce((s, r) => s + r.revenue, 0)
    const avgOrder = filtered.length ? Math.round(totalRev / filtered.length) : 0
    const profit = Math.round(totalRev * 0.4)
    const totalQty = filtered.reduce((s, r) => s + (r.quantity || 0), 0)

    const cats = [...new Set(data.map(r => r.category).filter(Boolean))].sort()
    const cities = [...new Set(data.map(r => r.city).filter(Boolean))].sort()
    const products = [...new Set(data.map(r => r.product).filter(Boolean))].sort()

    const catData = cats.map(c => ({ name: c, revenue: Math.round(filtered.filter(r => r.category === c).reduce((s, r) => s + r.revenue, 0)) })).filter(d => d.revenue > 0)
    const cityData = cities.map(c => ({ name: c, revenue: Math.round(filtered.filter(r => r.city === c).reduce((s, r) => s + r.revenue, 0)) })).filter(d => d.revenue > 0).sort((a, b) => b.revenue - a.revenue)
    const monthData = MONTHS.map((m, i) => ({ name: m, revenue: Math.round(filtered.filter(r => parseInt((r.date || '').split('-')[1]) === i + 1).reduce((s, r) => s + r.revenue, 0)) }))
    const pieData = catData.map((d, i) => ({ ...d, fill: COLORS[i % COLORS.length] }))

    const totalPages = Math.ceil(data.length / rowsPerPage)
    const tableRows = data.slice((page - 1) * rowsPerPage, page * rowsPerPage)

    const compareResult = compareP1 && compareP2 && compareP1 !== compareP2 ? compareProducts(data, compareP1, compareP2) : null

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'ai', label: 'AI Insights', icon: '🤖' },
        { id: 'compare', label: 'Compare', icon: '⚖️' },
        { id: 'upload', label: 'Upload data', icon: '📁' },
        { id: 'table', label: 'Data table', icon: '📋' },
    ]

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0f1117' }}>

            {/* Sidebar */}
            <div style={{ width: '220px', background: '#151929', borderRight: '1px solid #2d3748', display: 'flex', flexDirection: 'column', padding: '1.25rem 0', position: 'fixed', height: '100vh', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 1.25rem 1.5rem' }}>
                    <div style={{ width: '32px', height: '32px', background: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📊</div>
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '15px', color: '#e2e8f0' }}>DataLens</div>
                        <div style={{ fontSize: '11px', color: '#718096' }}>Analytics</div>
                    </div>
                </div>

                {navItems.map(n => (
                    <div key={n.id} onClick={() => setSection(n.id)} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 1.25rem', cursor: 'pointer', fontSize: '13px',
                        background: section === n.id ? 'rgba(59,130,246,0.12)' : 'transparent',
                        color: section === n.id ? '#3b82f6' : '#718096',
                        borderLeft: section === n.id ? '2px solid #3b82f6' : '2px solid transparent',
                        fontWeight: section === n.id ? '600' : '400'
                    }}>
                        <span>{n.icon}</span>{n.label}
                        {n.id === 'ai' && <span style={{ marginLeft: 'auto', background: '#3b82f6', color: '#fff', fontSize: '9px', padding: '1px 5px', borderRadius: '10px' }}>NEW</span>}
                    </div>
                ))}

                <div style={{ marginTop: 'auto', padding: '1.25rem', borderTop: '1px solid #2d3748' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>{user.name}</div>
                        <button onClick={() => setHelpOpen(true)} title="Help" style={{ background: 'none', border: '1px solid #2d3748', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', color: '#718096', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</button>
                    </div>
                    <div style={{ fontSize: '11px', color: '#718096', marginBottom: '10px' }}>{user.email}</div>
                    <button onClick={onLogout} style={{ fontSize: '12px', padding: '6px 12px', width: '100%', background: 'transparent', border: '1px solid #2d3748', borderRadius: '8px', color: '#718096', cursor: 'pointer' }}>Sign out</button>
                </div>
            </div>

            {/* Main */}
            <div style={{ flex: 1, marginLeft: '220px', padding: '1.5rem', overflowY: 'auto', color: '#e2e8f0' }}>

                {/* ── DASHBOARD ── */}
                {section === 'dashboard' && (
                    <div id="dashboard-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                                <div style={{ fontSize: '20px', fontWeight: '700' }}>Dashboard</div>
                                <div style={{ fontSize: '12px', color: '#718096' }}>{fileName} · {filtered.length} orders</div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <ExportButtons data={data} filtered={filtered} />
                                {[
                                    { val: catFilter, set: setCatFilter, opts: cats, label: 'All categories' },
                                    { val: cityFilter, set: setCityFilter, opts: cities, label: 'All cities' },
                                ].map((f, i) => (
                                    <select key={i} value={f.val} onChange={e => f.set(e.target.value)} style={{ background: '#1a1f2e', border: '1px solid #2d3748', color: '#e2e8f0', padding: '6px 10px', borderRadius: '8px', fontSize: '12px' }}>
                                        <option value="">{f.label}</option>
                                        {f.opts.map(o => <option key={o}>{o}</option>)}
                                    </select>
                                ))}
                                <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} style={{ background: '#1a1f2e', border: '1px solid #2d3748', color: '#e2e8f0', padding: '6px 10px', borderRadius: '8px', fontSize: '12px' }}>
                                    <option value="">All months</option>
                                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                                </select>
                                {(catFilter || cityFilter || monthFilter) && (
                                    <button onClick={() => { setCatFilter(''); setCityFilter(''); setMonthFilter('') }} style={{ background: 'transparent', border: '1px solid #2d3748', color: '#718096', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Reset</button>
                                )}
                            </div>
                        </div>
                        <div
                            style={{
                                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                padding: '20px',
                                borderRadius: '14px',
                                marginBottom: '20px',
                                color: 'white'
                            }}
                        >
                            <h2 style={{ margin: 0 }}>
                                Welcome back, {user.name} 👋
                            </h2>

                            <p
                                style={{
                                    marginTop: '8px',
                                    opacity: 0.9,
                                    fontSize: '14px'
                                }}
                            >
                                Monitor revenue, orders and business performance in real time.
                            </p>
                        </div>

                        {/* Metrics */}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
                            {[
                                { label: 'Total revenue', value: fmtRev(totalRev), icon: '💰', color: '#3b82f6' },
                                { label: 'Total orders', value: filtered.length.toLocaleString('en-IN'), icon: '📦', color: '#10b981' },
                                { label: 'Avg order value', value: fmtRev(avgOrder), icon: '📈', color: '#f59e0b' },
                                { label: 'Units sold', value: totalQty.toLocaleString('en-IN'), icon: '🛒', color: '#8b5cf6' },
                            ].map(m => (
                                <div
                                    key={m.label}
                                    style={{
                                        ...card,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.25s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-5px)'
                                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.35)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)'
                                        e.currentTarget.style.boxShadow = 'none'
                                    }}
                                >
                                    <div style={{ fontSize: '22px', marginBottom: '6px' }}>{m.icon}</div>
                                    <div style={{ fontSize: '11px', color: '#718096', marginBottom: '6px' }}>{m.label}</div>
                                    <div style={{ fontSize: '22px', fontWeight: '700', color: m.color }}>{m.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Charts row 1 */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                            <div
                                style={{
                                    ...card,
                                    transition: 'all 0.25s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)'
                                    e.currentTarget.style.borderColor = '#3b82f6'
                                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.35)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.borderColor = '#2d3748'
                                    e.currentTarget.style.boxShadow = 'none'
                                }}
                            >
                                <div style={{ fontSize: '12px', color: '#718096', marginBottom: '12px', fontWeight: '600' }}>Revenue by category</div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={catData}>
                                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#718096' }} />
                                        <YAxis tick={{ fontSize: 10, fill: '#718096' }} tickFormatter={fmtRev} />
                                        <Tooltip formatter={fmtRev} contentStyle={tooltipStyle} />
                                        <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                                            {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div
                                style={{
                                    ...card,
                                    transition: 'all 0.25s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)'
                                    e.currentTarget.style.borderColor = '#3b82f6'
                                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.35)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.borderColor = '#2d3748'
                                    e.currentTarget.style.boxShadow = 'none'
                                }}
                            >
                                <div style={{ fontSize: '12px', color: '#718096', marginBottom: '12px', fontWeight: '600' }}>Category share</div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="revenue" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: '10px' }}>
                                            {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                                        </Pie>
                                        <Tooltip formatter={fmtRev} contentStyle={tooltipStyle} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Charts row 2 */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                            <div
                                style={{
                                    ...card,
                                    transition: 'all 0.25s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)'
                                    e.currentTarget.style.borderColor = '#3b82f6'
                                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.35)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.borderColor = '#2d3748'
                                    e.currentTarget.style.boxShadow = 'none'
                                }}
                            >
                                <div style={{ fontSize: '12px', color: '#718096', marginBottom: '12px', fontWeight: '600' }}>Revenue by city</div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={cityData} layout="vertical">
                                        <XAxis type="number" tick={{ fontSize: 10, fill: '#718096' }} tickFormatter={fmtRev} />
                                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#718096' }} width={70} />
                                        <Tooltip formatter={fmtRev} contentStyle={tooltipStyle} />
                                        <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div
                                style={{
                                    ...card,
                                    transition: 'all 0.25s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)'
                                    e.currentTarget.style.borderColor = '#3b82f6'
                                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.35)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.borderColor = '#2d3748'
                                    e.currentTarget.style.boxShadow = 'none'
                                }}
                            >
                                <div style={{ fontSize: '12px', color: '#718096', marginBottom: '12px', fontWeight: '600' }}>Monthly revenue trend</div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={monthData}>
                                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#718096' }} />
                                        <YAxis tick={{ fontSize: 10, fill: '#718096' }} tickFormatter={fmtRev} />
                                        <Tooltip formatter={fmtRev} contentStyle={tooltipStyle} />
                                        <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <SmartAlerts data={filtered} />
                    </div>
                )}

                {/* ── AI INSIGHTS ── */}
                {section === 'ai' && (
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>🤖 AI Insights</div>
                        <div style={{ fontSize: '12px', color: '#718096', marginBottom: '1.5rem' }}>ML-powered predictions and recommendations from your data</div>

                        {!aiResult && (
                            <div style={{ ...card, textAlign: 'center', padding: '3rem' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
                                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Ready to analyze your data</div>
                                <div style={{ fontSize: '13px', color: '#718096', marginBottom: '1.5rem' }}>AI will predict next month revenue, identify trends, and give recommendations</div>
                                <button onClick={runAIPrediction} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 28px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                                    {aiLoading ? '⏳ Analyzing...' : '✨ Run AI Analysis'}
                                </button>
                            </div>
                        )}

                        {aiResult && (
                            <div>
                                {/* Prediction cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
                                    {[
                                        { label: 'Next month prediction', value: fmtRev(aiResult.nextMonthRevenue), icon: '🔮', color: '#8b5cf6', sub: 'Based on trend analysis' },
                                        { label: 'Growth trend', value: aiResult.growthTrend, icon: '📈', color: aiResult.growthTrend.startsWith('+') ? '#10b981' : '#ef4444', sub: 'Month over month' },
                                        { label: 'Top performing', value: aiResult.topCategory, icon: '🏆', color: '#f59e0b', sub: fmtRev(aiResult.topCategoryRevenue) + ' revenue' },
                                    ].map(m => (
                                        <div key={m.label} style={{ ...card, textAlign: 'center' }}>
                                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{m.icon}</div>
                                            <div style={{ fontSize: '11px', color: '#718096', marginBottom: '6px' }}>{m.label}</div>
                                            <div style={{ fontSize: '24px', fontWeight: '700', color: m.color, marginBottom: '4px' }}>{m.value}</div>
                                            <div style={{ fontSize: '11px', color: '#718096' }}>{m.sub}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Recommendation */}
                                <div style={{ ...card, marginBottom: '1.5rem', borderLeft: '3px solid #3b82f6', background: 'rgba(59,130,246,0.08)' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>💡 AI Recommendation</div>
                                    <div style={{ fontSize: '14px', color: '#e2e8f0' }}>{aiResult.recommendation}</div>
                                </div>

                                {/* Forecast chart */}
                                <div style={card}>
                                    <div style={{ fontSize: '12px', color: '#718096', marginBottom: '12px', fontWeight: '600' }}>Actual vs Predicted Revenue</div>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <LineChart data={aiResult.forecastData}>
                                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#718096' }} />
                                            <YAxis tick={{ fontSize: 10, fill: '#718096' }} tickFormatter={fmtRev} />
                                            <Tooltip formatter={fmtRev} contentStyle={tooltipStyle} />
                                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                                            <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Actual" />
                                            <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Predicted" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                <button onClick={() => setAiResult(null)} style={{ marginTop: '1rem', background: 'transparent', border: '1px solid #2d3748', color: '#718096', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>🔄 Re-run Analysis</button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── COMPARE ── */}
                {section === 'compare' && (
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>⚖️ Product Comparison</div>
                        <div style={{ fontSize: '12px', color: '#718096', marginBottom: '1.5rem' }}>Compare any two products side by side</div>

                        <div style={{ ...card, marginBottom: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {[
                                    { val: compareP1, set: setCompareP1, label: 'Product 1', color: '#3b82f6' },
                                    { val: compareP2, set: setCompareP2, label: 'Product 2', color: '#10b981' },
                                ].map(p => (
                                    <div key={p.label}>
                                        <label style={{ fontSize: '12px', color: p.color, fontWeight: '600', display: 'block', marginBottom: '6px' }}>{p.label}</label>
                                        <select value={p.val} onChange={e => p.set(e.target.value)} style={{ background: '#0f1117', border: `1px solid ${p.color}`, color: '#e2e8f0', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', width: '100%' }}>
                                            <option value="">Select product...</option>
                                            {products.map(pr => <option key={pr}>{pr}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {!compareP1 || !compareP2 ? (
                            <div style={{ ...card, textAlign: 'center', padding: '3rem', color: '#718096' }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚖️</div>
                                <div style={{ fontSize: '14px' }}>Select two products above to compare</div>
                            </div>
                        ) : compareP1 === compareP2 ? (
                            <div style={{ ...card, textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
                                ⚠️ Please select two different products
                            </div>
                        ) : compareResult && (
                            <div>
                                {/* Winner banner */}
                                <div style={{ ...card, textAlign: 'center', marginBottom: '1.5rem', background: 'rgba(59,130,246,0.08)', borderLeft: `3px solid #f59e0b` }}>
                                    <div style={{ fontSize: '13px', color: '#718096', marginBottom: '4px' }}>🏆 Winner</div>
                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b' }}>{compareResult.winner}</div>
                                    <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>Higher total revenue</div>
                                </div>

                                {/* Stats comparison */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                                    {[compareP1, compareP2].map((p, pi) => {
                                        const s = compareResult.stats[p]
                                        const color = pi === 0 ? '#3b82f6' : '#10b981'
                                        return (
                                            <div key={p} style={{ ...card, borderTop: `3px solid ${color}` }}>
                                                <div style={{ fontSize: '14px', fontWeight: '700', color, marginBottom: '1rem' }}>{p}</div>
                                                {[
                                                    { label: 'Total Revenue', value: fmtRev(s.revenue) },
                                                    { label: 'Total Orders', value: s.orders },
                                                    { label: 'Units Sold', value: s.qty },
                                                    { label: 'Avg Order Value', value: fmtRev(s.avg) },
                                                    { label: 'Cities Present', value: s.cities },
                                                ].map(stat => (
                                                    <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #2d3748', fontSize: '13px' }}>
                                                        <span style={{ color: '#718096' }}>{stat.label}</span>
                                                        <span style={{ fontWeight: '600', color }}>{stat.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Radar chart */}
                                <div style={card}>
                                    <div style={{ fontSize: '12px', color: '#718096', marginBottom: '12px', fontWeight: '600' }}>Performance Radar</div>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <RadarChart data={compareResult.radar}>
                                            <PolarGrid stroke="#2d3748" />
                                            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#718096' }} />
                                            <Radar name={compareP1} dataKey={compareP1} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                                            <Radar name={compareP2} dataKey={compareP2} stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                                            <Tooltip contentStyle={tooltipStyle} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── UPLOAD ── */}
                {section === 'upload' && (
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>📁 Upload Data</div>
                        <div style={{ fontSize: '12px', color: '#718096', marginBottom: '1.5rem' }}>Upload your CSV — dashboard updates instantly</div>
                        <div style={{ ...card, textAlign: 'center', padding: '3rem', border: '2px dashed #2d3748', cursor: 'pointer', background: 'rgba(59,130,246,0.02)' }} onClick={() => document.getElementById('csv-input').click()}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📂</div>
                            <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Drop CSV file here</div>
                            <div style={{ fontSize: '13px', color: '#718096', marginBottom: '1.5rem' }}>Any CSV with sales/order data · Auto column detection</div>
                            <button type="button" style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Browse file</button>
                            <input id="csv-input" type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFile} />
                        </div>
                        <div style={{ ...card, marginTop: '1.25rem' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>Auto-detected columns:</div>
                            {[
                                { col: 'revenue / amount / sales', req: 'Required', color: '#ef4444' },
                                { col: 'category / type', req: 'Optional', color: '#718096' },
                                { col: 'city / location', req: 'Optional', color: '#718096' },
                                { col: 'date / order_date', req: 'Optional', color: '#718096' },
                                { col: 'product / product_name', req: 'Optional', color: '#718096' },
                                { col: 'quantity / qty', req: 'Optional', color: '#718096' },
                            ].map(r => (
                                <div key={r.col} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #2d3748', fontSize: '13px' }}>
                                    <code style={{ color: '#3b82f6', fontSize: '12px' }}>{r.col}</code>
                                    <span style={{ color: r.color, fontSize: '11px', fontWeight: '600' }}>{r.req}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── TABLE ── */}
                {section === 'table' && (
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>📋 Data Table</div>
                        <div style={{ fontSize: '12px', color: '#718096', marginBottom: '1.25rem' }}>{data.length} rows · Page {page} of {totalPages}</div>
                        <div style={{ ...card, overflowX: 'auto', padding: '0' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #2d3748' }}>
                                        {['Product', 'Category', 'City', 'Date', 'Qty', 'Revenue'].map(h => (
                                            <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', color: '#718096', fontWeight: '600' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableRows.map((r, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #2d3748' }}>
                                            <td style={{ padding: '9px 14px' }}>{r.product || '—'}</td>
                                            <td style={{ padding: '9px 14px' }}>
                                                <span style={{ background: 'rgba(59,130,246,0.15)', color: '#93c5fd', padding: '2px 8px', borderRadius: '20px', fontSize: '11px' }}>{r.category || '—'}</span>
                                            </td>
                                            <td style={{ padding: '9px 14px', color: '#718096' }}>{r.city || '—'}</td>
                                            <td style={{ padding: '9px 14px', color: '#718096' }}>{r.date || '—'}</td>
                                            <td style={{ padding: '9px 14px', color: '#718096' }}>{r.quantity || '—'}</td>
                                            <td style={{ padding: '9px 14px', fontWeight: '600', color: '#10b981' }}>₹{Number(r.revenue).toLocaleString('en-IN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '1rem', fontSize: '13px' }}>
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ background: 'transparent', border: '1px solid #2d3748', color: '#718096', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>← Prev</button>
                            <span style={{ color: '#718096' }}>Page {page} of {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ background: 'transparent', border: '1px solid #2d3748', color: '#718096', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Next →</button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── HELP MODAL ── */}
            {helpOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setHelpOpen(false)}>
                    <div style={{ ...card, maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ fontSize: '16px', fontWeight: '700' }}>❓ Help & Guide</div>
                            <button onClick={() => setHelpOpen(false)} style={{ background: 'none', border: 'none', color: '#718096', fontSize: '18px', cursor: 'pointer' }}>✕</button>
                        </div>
                        {[
                            { icon: '📊', title: 'Dashboard', desc: 'View charts and KPIs. Use filters (category, city, month) to slice data. Reset to clear all filters.' },
                            { icon: '🤖', title: 'AI Insights', desc: 'Click "Run AI Analysis" to get ML-powered predictions, growth trends, and business recommendations.' },
                            { icon: '⚖️', title: 'Compare', desc: 'Select any two products to compare revenue, orders, units sold and see a radar performance chart.' },
                            { icon: '📁', title: 'Upload Data', desc: 'Upload your own CSV file. Columns are auto-detected. Supported: revenue, category, city, date, product, quantity.' },
                            { icon: '📋', title: 'Data Table', desc: 'Browse all rows of your data with pagination.' },
                            { icon: '🔐', title: 'Login / Register', desc: 'Create your own account with any email and password. Data is saved in the backend database.' },
                        ].map(h => (
                            <div key={h.title} style={{ padding: '12px 0', borderBottom: '1px solid #2d3748' }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>{h.icon} {h.title}</div>
                                <div style={{ fontSize: '12px', color: '#718096' }}>{h.desc}</div>
                            </div>
                        ))}
                        <button onClick={() => setHelpOpen(false)} style={{ marginTop: '1rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', width: '100%' }}>Got it!</button>
                    </div>
                </div>
            )}
        </div>
    )
}
