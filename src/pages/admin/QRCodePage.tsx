import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { storage } from '../../lib/storage';
import { Table } from '../../types';
import { Download, Printer, QrCode } from 'lucide-react';
import { toast } from 'sonner';

export default function QRCodePage() {
  const [tables, setTables] = useState<Table[]>([]);
  const origin = window.location.origin;

  useEffect(() => {
    const loadTables = async () => {
      const data = await storage.getAll<Table>('tables');
      setTables(data);
    };
    loadTables();
  }, []);

  const downloadQR = (tableNumber: string) => {
    const canvas = document.getElementById(`qr-table-${tableNumber}`) as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `CafeVitus-Table-${tableNumber}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success(`Downloaded QR for Table ${tableNumber}`);
    }
  };

  const downloadAll = () => {
    tables.forEach((table, i) => {
      setTimeout(() => {
        downloadQR(table.number);
      }, i * 300);
    });
    toast.success('Started downloading all QR codes');
  };

  const printQR = (tableNumber: string) => {
    const canvas = document.getElementById(`qr-table-${tableNumber}`) as HTMLCanvasElement;
    if (canvas) {
      const windowContent = '<!DOCTYPE html>' +
        '<html>' +
        '<head><title>Print QR</title>' +
        '<style>body{display:flex;justify-content:center;align-items:center;height:100vh;margin:0;flex-direction:column;font-family:sans-serif;} img{max-width:300px;margin-bottom:20px;} h1{margin:0;font-size:24px;}</style>' +
        '</head>' +
        '<body>' +
        '<h1>Cafe Vitus - Table ' + tableNumber + '</h1>' +
        '<img src="' + canvas.toDataURL() + '"/>' +
        '<p>Scan to order</p>' +
        '</body>' +
        '</html>';
      
      const printWin = window.open('', '', 'width=800,height=600');
      if (printWin) {
        printWin.document.open();
        printWin.document.write(windowContent);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => {
          printWin.print();
          printWin.close();
        }, 500);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <QrCode className="w-8 h-8 text-ocean-600" />
            Table QR Codes
          </h1>
          <p className="text-slate-500">Generate and print QR codes for customer ordering</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-xl font-medium transition-colors"
          >
            <Printer className="w-5 h-5" /> Print All
          </button>
          <button 
            onClick={downloadAll}
            className="flex items-center gap-2 bg-ocean-600 hover:bg-ocean-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            <Download className="w-5 h-5" /> Download All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 print:grid-cols-2 print:gap-8">
        {tables.map(table => {
          const orderUrl = `${origin}/?table=${table.number}`;
          
          return (
            <div key={table.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm print:break-inside-avoid print:shadow-none print:border-2 print:border-black">
              <h2 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">Cafe Vitus</h2>
              <p className="text-slate-500 text-sm mb-6">Scan to order</p>
              
              <div className="bg-white p-4 rounded-xl shadow-inner mb-6">
                <QRCodeCanvas
                  id={`qr-table-${table.number}`}
                  value={orderUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                  className="rounded-lg"
                />
              </div>
              
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-6">
                Table {table.number}
              </div>

              <div className="flex gap-2 w-full print:hidden">
                <button 
                  onClick={() => downloadQR(table.number)}
                  className="flex-1 flex justify-center items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 rounded-lg transition-colors font-medium text-sm"
                >
                  <Download className="w-4 h-4" /> Save
                </button>
                <button 
                  onClick={() => printQR(table.number)}
                  className="flex-1 flex justify-center items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 rounded-lg transition-colors font-medium text-sm"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
