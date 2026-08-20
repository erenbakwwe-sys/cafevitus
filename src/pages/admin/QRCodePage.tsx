import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { storage } from '../../lib/storage';
import { Table } from '../../types';
import { Download, Printer, QrCode, Sparkles, MapPin, Coffee } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';

export default function QRCodePage() {
  const [tables, setTables] = useState<Table[]>([]);
  const { language } = useLanguage();
  const origin = window.location.origin;

  useEffect(() => {
    const loadTables = async () => {
      const data = await storage.getAll<Table>('tables');
      setTables(data.sort((a, b) => parseInt(a.number) - parseInt(b.number)));
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
      downloadLink.download = `CafeVitus-Bord-${tableNumber}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success(language === 'da' ? `Bord ${tableNumber} QR-kode downloadet` : `Table ${tableNumber} QR downloaded`);
    }
  };

  const downloadAll = () => {
    tables.forEach((table, i) => {
      setTimeout(() => {
        downloadQR(table.number);
      }, i * 250);
    });
    toast.success(language === 'da' ? 'Downloader alle bord QR-koder...' : 'Downloading all table QR codes...');
  };

  const printQR = (tableNumber: string) => {
    const canvas = document.getElementById(`qr-table-${tableNumber}`) as HTMLCanvasElement;
    if (canvas) {
      const windowContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cafe Vitus - Bord ${tableNumber}</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; flex-direction: column; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; }
            .card { border: 3px solid #000; border-radius: 24px; padding: 40px; max-width: 320px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            h1 { margin: 0 0 4px 0; font-size: 26px; font-weight: 900; }
            p.sub { margin: 0 0 20px 0; font-size: 13px; color: #555; }
            img { max-width: 220px; margin-bottom: 20px; border-radius: 12px; }
            .badge { font-size: 28px; font-weight: 900; background: #000; color: #fff; padding: 8px 24px; border-radius: 16px; display: inline-block; margin-bottom: 12px; }
            .instruction { font-size: 12px; color: #666; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>CAFE VITUS</h1>
            <p class="sub">Snekkersten Havn • Danmark</p>
            <img src="${canvas.toDataURL()}"/>
            <div>
              <div class="badge">BORD ${tableNumber}</div>
            </div>
            <p class="instruction">Scan QR-koden for at se menukortet og bestille direkte til bordet.</p>
          </div>
        </body>
        </html>
      `;
      
      const printWin = window.open('', '', 'width=800,height=700');
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black Outfit flex items-center gap-3 text-slate-900 dark:text-white">
            <QrCode className="w-8 h-8 text-amber-500" />
            <span>{language === 'da' ? 'Bord-Specifikke QR Koder' : 'Table Dedicated QR Codes'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
            {language === 'da' 
              ? 'Hvert bord har sin egen unikke QR-kode. Når kunden scanner, genkendes bordet automatisk!' 
              : 'Each table has a dedicated QR code. When scanned, the table is automatically recognized!'}
          </p>
        </div>
        
        <div className="flex gap-2.5">
          <button 
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-xl font-black text-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" /> 
            <span>{language === 'da' ? 'Udskriv Alle' : 'Print All'}</span>
          </button>
          <button 
            type="button"
            onClick={downloadAll}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 px-4 py-2.5 rounded-xl font-black text-xs transition-colors shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" /> 
            <span>{language === 'da' ? 'Download Alle' : 'Download All'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 print:grid-cols-2 print:gap-8">
        {tables.map((table) => {
          const orderUrl = `${origin}/?table=${table.number}`;
          
          return (
            <div 
              key={table.id} 
              className="bg-white dark:bg-[#0E172A] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all print:break-inside-avoid print:shadow-none print:border-2 print:border-black"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black mb-3 shadow-md">
                <Coffee className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Cafe Vitus</h2>
              <p className="text-slate-500 text-[11px] font-semibold mb-4">Snekkersten Havn</p>
              
              {/* High-Resolution QR Canvas */}
              <div className="bg-white p-3.5 rounded-2xl shadow-inner border border-slate-100 mb-4">
                <QRCodeCanvas
                  id={`qr-table-${table.number}`}
                  value={orderUrl}
                  size={180}
                  level="H"
                  includeMargin={true}
                  className="rounded-xl"
                />
              </div>
              
              {/* Big Bold Dedicated Table Badge */}
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-950 text-white dark:bg-amber-500 dark:text-slate-950 font-black text-base mb-4 shadow-sm">
                <MapPin className="w-4 h-4" />
                <span>Bord {table.number}</span>
              </div>

              <p className="text-[11px] text-slate-400 font-semibold mb-5 print:hidden">
                {language === 'da' ? 'Scanner låses automatisk til Bord ' + table.number : 'Scans automatically lock to Table ' + table.number}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2 w-full print:hidden">
                <button 
                  type="button"
                  onClick={() => downloadQR(table.number)}
                  className="flex-1 flex justify-center items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 py-2 rounded-xl transition-colors font-bold text-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> 
                  <span>{language === 'da' ? 'Gem' : 'Save'}</span>
                </button>
                <button 
                  type="button"
                  onClick={() => printQR(table.number)}
                  className="flex-1 flex justify-center items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 py-2 rounded-xl transition-colors font-bold text-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> 
                  <span>{language === 'da' ? 'Udskriv' : 'Print'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
