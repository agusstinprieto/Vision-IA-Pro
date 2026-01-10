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
        doc.text('VISION IA PRO', 15, 20);

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
            doc.text(`Documento generado por VISION IA PRO - Página ${i} de ${pageCount}`, 105, 285, { align: 'center' });
        }

        doc.save(`VISION-Reporte-Llantas-${new Date().toISOString().split('T')[0]}.pdf`);
    },

    generateTechnicalSpec: (tire: { size: string, brand: string, model: string, type: string, features: string[] }) => {
        const doc = new jsPDF() as jsPDFWithAutoTable;

        // 1. Header with Brand Color
        doc.setFillColor(234, 73, 46); // Brand Orange
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('FICHA TÉCNICA', 105, 25, { align: 'center' });
        doc.setFontSize(10);
        doc.text('VISION IA PRO - CATALOGO OFICIAL', 105, 35, { align: 'center' });

        // 2. Main Tire Info
        doc.setTextColor(30, 30, 33);
        doc.setFontSize(60);
        doc.text(tire.size, 105, 70, { align: 'center' });

        doc.setFontSize(20);
        doc.setTextColor(100, 100, 100);
        doc.text(`${tire.brand} ${tire.model}`, 105, 85, { align: 'center' });

        // 3. Technical Specs Box
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(25, 100, 160, 80, 3, 3, 'F');

        doc.setFontSize(12);
        doc.setTextColor(30, 30, 33);
        doc.text('ESPECIFICACIONES DEL PRODUCTO', 105, 115, { align: 'center' });

        const specs = [
            ['Aplicación:', tire.type],
            ['Profundidad de Piso:', 'Original 18mm'],
            ['Indice de Carga:', '152/148M'],
            ['Tecnología:', 'Smart RFID Ready']
        ];

        let yPos = 135;
        specs.forEach(([label, value]) => {
            doc.setFont('helvetica', 'bold');
            doc.text(label, 40, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(value, 100, yPos);
            yPos += 10;
        });

        // 4. Features List
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('BENEFICIOS CLAVE', 25, 200);

        tire.features.forEach((feat, i) => {
            doc.setFillColor(234, 73, 46);
            doc.circle(30, 210 + (i * 10), 1.5, 'F');
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.text(feat, 35, 211 + (i * 10));
        });

        // 5. Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Documento generado automáticamente por VISION IA PRO', 105, 280, { align: 'center' });

        doc.save(`Ficha-${tire.brand}-${tire.size.replace('/', '-')}.pdf`);
    },

    generateDriverReport: (workers: any[]) => {
        const doc = new jsPDF() as jsPDFWithAutoTable;

        // 1. Header
        doc.setFillColor(185, 28, 28); // Dark Red for Emergency
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('VISION IA PRO SAFETY', 15, 20);

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

        doc.save(`VISION-Emergencia-Salud-${new Date().toISOString().split('T')[0]}.pdf`);
    }
};
