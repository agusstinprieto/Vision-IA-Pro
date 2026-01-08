import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InventoryTire, Unit } from '../../types';

export const pdfService = {
    generateTireReport: (tires: InventoryTire[], _units: Unit[] = []) => {
        const doc = new jsPDF();
        const brandColor = [234, 73, 46]; // #EA492E

        // 1. Header & Branding
        doc.setFillColor(30, 30, 33);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('SIMSA VISION IA', 15, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('REPORTE EJECUTIVO DE SALUD DE NEUMÁTICOS', 15, 30);
        doc.text(`FECHA: ${new Date().toLocaleDateString()}`, 155, 20);

        // 2. Summary Stats
        const criticalCount = tires.filter(t => t.status === 'ROJA').length;
        const warningCount = tires.filter(t => t.status === 'AMARILLA').length;

        doc.setTextColor(30, 30, 33);
        doc.setFontSize(14);
        doc.text('RESUMEN DE FLOTA', 15, 55);

        doc.setFontSize(10);
        doc.text(`Total de Neumáticos Auditados: ${tires.length}`, 15, 65);
        doc.setTextColor(234, 73, 46);
        doc.text(`Críticos (Rempalzo Urgente): ${criticalCount}`, 155, 65);

        doc.setDrawColor(200, 200, 200);
        doc.line(15, 75, 195, 75);

        // 3. Data Table
        const tableData = tires.map(t => [
            t.unit_id,
            t.position,
            `${t.brand} ${t.model || ''}`,
            `${t.depth_mm} mm`,
            t.status
        ]);

        autoTable(doc, {
            startY: 85,
            head: [['UNIDAD', 'POSICIÓN', 'MARCA/MODELO', 'PROFUNDIDAD', 'ESTADO']],
            body: tableData,
            headStyles: {
                fillColor: [30, 30, 33],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                fontSize: 9,
                halign: 'center'
            },
            columnStyles: {
                4: { fontStyle: 'bold' }
            },
            didParseCell: (data: any) => {
                if (data.column.index === 4) {
                    const status = data.cell.raw;
                    if (status === 'ROJA') data.cell.styles.textColor = [220, 38, 38];
                    if (status === 'AMARILLA') data.cell.styles.textColor = [217, 119, 6];
                    if (status === 'VERDE') data.cell.styles.textColor = [5, 150, 105];
                }
            }
        });

        // 4. Footer
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Documento generado por SIMSA IA Control Tower - Página ${i} de ${pageCount}`, 105, 285, { align: 'center' });
        }

        doc.save(`SIMSA-Reporte-Llantas-${new Date().toISOString().split('T')[0]}.pdf`);
    },

    generateDriverReport: (workers: any[]) => {
        const doc = new jsPDF() as jsPDFWithAutoTable;

        // 1. Header
        doc.setFillColor(185, 28, 28); // Dark Red for Emergency
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('SIMSA SAFETY IA', 15, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('REPORTE FORENSE DE SALUD DEL OPERADOR', 15, 30);
        doc.text(`ALERTA: CRITICAL INCIDENT`, 155, 20);

        // 2. Data Table
        const tableData = workers.map(w => [
            w.name,
            w.unit_assigned || 'N/A',
            `${w.risk_score}%`,
            w.status,
            w.metrics?.heart_rate || 'N/A'
        ]);

        doc.autoTable({
            startY: 50,
            head: [['OPERADOR', 'UNIDAD', 'RIESGO', 'ESTADO', 'BPM']],
            body: tableData,
            headStyles: { fillColor: [30, 30, 33] },
            didParseCell: (data: any) => {
                if (data.column.index === 2) {
                    const risk = parseInt(data.cell.raw);
                    if (risk > 80) data.cell.styles.textColor = [220, 38, 38];
                }
            }
        });

        doc.save(`SIMSA-Emergencia-Salud-${new Date().toISOString().split('T')[0]}.pdf`);
    }
};
