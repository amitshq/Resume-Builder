import React, { useState, useRef, useCallback } from 'react';
import { ResumeEditor } from './components/ResumeEditor';
import { ResumePreview } from './components/ResumePreview';
import { initialResumeData } from './constants';
import type { ResumeData } from './types';
import { DownloadIcon, MailIcon, ShareIcon, FeedbackIcon } from './components/icons';

// Declare jspdf and html2canvas from global scope
declare const jspdf: any;
declare const html2canvas: any;

const App: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = useCallback(() => {
    if (previewRef.current) {
      setIsGeneratingPdf(true);
      html2canvas(previewRef.current, {
        scale: 2, // Increase scale for better resolution
        useCORS: true, 
      }).then((canvas: HTMLCanvasElement) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: 'a4',
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        
        const imgWidth = pdfWidth;
        const imgHeight = imgWidth / ratio;
        
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }

        pdf.save(`${resumeData.header.name.replace(/\s/g, '_') || 'resume'}.pdf`);
        setIsGeneratingPdf(false);
      }).catch((error: Error) => {
        console.error("Error generating PDF:", error);
        setIsGeneratingPdf(false);
      });
    }
  }, [resumeData.header.name]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="w-[1200px] mx-auto">
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 sticky top-0 z-20">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">AI Resume Builder</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <DownloadIcon />
                <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
              </button>
              <a href={`mailto:?subject=Resume of ${resumeData.header.name}`} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><MailIcon /></a>
              <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><ShareIcon /></button>
              <a href="mailto:feedback@airesumebuilder.com" className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><FeedbackIcon /></a>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-1">
            <ResumeEditor data={resumeData} setData={setResumeData} />
          </div>
          <div className="mt-8 lg:mt-0 lg:col-span-2">
            <div className="sticky top-24">
              <ResumePreview ref={previewRef} data={resumeData} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;