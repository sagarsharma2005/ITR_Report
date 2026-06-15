import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export default function ExportButtons({ data, filtered }) {

  // ── Export PDF ─────────────────────────────────────────
  async function exportPDF() {
    const dashboard = document.getElementById('dashboard-content')
    if (!dashboard) return

    const canvas = await html2canvas(dashboard, {
      backgroundColor: '#0f1117',
      scale: 1.5,
      useCORS: true
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('l', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    pdf.setFillColor(15, 17, 23)
    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F')
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save('DataLens_Report.pdf')
  }

  // ── Export Excel ───────────────────────────────────────
  function exportExcel() {
    const exportData = filtered.map(r => ({
      'Product':        r.product || '',
      'Category':       r.category || '',
      'City':           r.city || '',
      'Date':           r.date || '',
      'Quantity':       r.quantity || 0,
      'Unit Price':     r.unit_price || 0,
      'Revenue (₹)':   r.revenue || 0,
      'Profit (₹)':    Math.round((r.revenue || 0) * 0.4),
    }))

    // Summary sheet
    const totalRev = filtered.reduce((s,r) => s+r.revenue, 0)
    const summary = [
      { 'Metric': 'Total Revenue',    'Value': totalRev },
      { 'Metric': 'Total Orders',     'Value': filtered.length },
      { 'Metric': 'Avg Order Value',  'Value': Math.round(totalRev/filtered.length) },
      { 'Metric': 'Total Profit',     'Value': Math.round(totalRev*0.4) },
    ]

    const wb = XLSX.utils.book_new()
    const ws1 = XLSX.utils.json_to_sheet(exportData)
    const ws2 = XLSX.utils.json_to_sheet(summary)

    // Column widths
    ws1['!cols'] = [
      {wch:20},{wch:15},{wch:12},{wch:12},
      {wch:10},{wch:12},{wch:14},{wch:14}
    ]

    XLSX.utils.book_append_sheet(wb, ws1, 'Sales Data')
    XLSX.utils.book_append_sheet(wb, ws2, 'Summary')

    const buf = XLSX.write(wb, { bookType:'xlsx', type:'array' })
    saveAs(new Blob([buf]), 'DataLens_Report.xlsx')
  }

  // ── Export CSV ────────────────────────────────────────
  function exportCSV() {
    const headers = ['Product','Category','City','Date','Quantity','Revenue']
    const rows = filtered.map(r =>
      [r.product,r.category,r.city,r.date,r.quantity,r.revenue].join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type:'text/csv' })
    saveAs(blob, 'DataLens_Data.csv')
  }

  const btnStyle = {
    display:'flex', alignItems:'center', gap:'6px',
    padding:'7px 14px', borderRadius:'8px', fontSize:'12px',
    fontWeight:'600', cursor:'pointer', border:'none'
  }

  return (
    <div style={{ display:'flex', gap:'8px' }}>
      <button onClick={exportPDF} style={{ ...btnStyle, background:'#ef4444', color:'#fff' }}>
        📄 PDF
      </button>
      <button onClick={exportExcel} style={{ ...btnStyle, background:'#10b981', color:'#fff' }}>
        📊 Excel
      </button>
      <button onClick={exportCSV} style={{ ...btnStyle, background:'#3b82f6', color:'#fff' }}>
        📁 CSV
      </button>
    </div>
  )
}