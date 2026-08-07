// worker.js

self.importScripts('Scripts/html2pdf.bundle.min.js');

self.onmessage = async function(e) {
    const { element } = e.data;
    try {
        const pdfBytes = await convertToPDFWithLogging(element);
        self.postMessage({ success: true, pdfBytes });
    } catch (error) {
        self.postMessage({ success: false, error });
    }
};

async function convertToPDFWithLogging(element) {
	return new Promise((resolve, reject) => {
	
		const originalConsoleLog = console.log;
		const title = '第 ' + (completedChunks + 1) + ' 組：';
		// Override console.log to capture logs
		console.log = function(message) {
			pdfLog(title + '花費時間=' + message);
			originalConsoleLog.apply(console, arguments);
		};
	
		html2pdf()
			.from(element)
			.set({
				log: true, // Enable logging for html2pdf
				margin: 0.5,
				image: { type: 'jpeg', quality: 0.98 },
				html2canvas: {
					cale: 2,
					useCORS: true,
					logging: true, // Enable logging for html2canvas
					onclone: (doc) => {
						//console.log('HTML2Canvas cloned document:', doc);
						//console.log('start');
						pdfLog(title + '開始')
					},
					log: (message) => {
						pdfLog(title + 'log=' + message);
					}
				},
				jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
			})
			.outputPdf('datauristring')
			.then((pdfString) => {
				console.log = originalConsoleLog;
				//pdfLog(title + '產出')
				resolve(pdfString);
			})
			.catch((error) => {
				console.log = originalConsoleLog;
				pdfLog(title + 'Error' + error);
				reject(error);
			});
	});
}