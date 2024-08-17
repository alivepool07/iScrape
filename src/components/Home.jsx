// import React, { useState } from 'react';
// import axios from 'axios';

// const Scraper = () => {
//     const [url, setUrl] = useState('');
//     const [types, setTypes] = useState({
//         text: false,
//         html: false,
//         images: false,
//         links: false,
//         structuredData: false,
//     });
//     const [result, setResult] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');

//     const handleCheckboxChange = (event) => {
//         setTypes({
//             ...types,
//             [event.target.name]: event.target.checked,
//         });
//     };

//     const handleSubmit = async () => {
//         setLoading(true);
//         setError('');
//         setResult(null);

//         try {
//             const response = await axios.post('http://localhost:5000/scrape', {
//                 url,
//                 types: Object.keys(types).filter((key) => types[key]),
//             });
//             setResult(response.data);
//         } catch (error) {
//             console.error('Error:', error);
//             setError('Failed to scrape the URL. Please try again.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="p-4 max-w-3xl mx-auto">
//             <h1 className="text-2xl font-bold text-center">Web Scraper</h1>

//             {/* URL Input Field */}
//             <input
//                 type="text"
//                 value={url}
//                 onChange={(e) => setUrl(e.target.value)}
//                 placeholder="Enter URL"
//                 className="border p-2 w-full mt-4"
//             />

//             {/* Data Types Selection */}
//             <div className="mt-4">
//                 <h2 className="text-xl font-semibold">Select Data Types to Scrape:</h2>
//                 <div className="flex flex-col space-y-2 mt-2">
//                     {Object.keys(types).map((type) => (
//                         <label key={type}>
//                             <input
//                                 type="checkbox"
//                                 name={type}
//                                 checked={types[type]}
//                                 onChange={handleCheckboxChange}
//                             />
//                             <span className="ml-2 capitalize">{type.replace(/([A-Z])/g, ' $1')}</span>
//                         </label>
//                     ))}
//                 </div>
//             </div>

//             {/* Submit Button */}
//             <button
//                 onClick={handleSubmit}
//                 className="bg-blue-500 text-white p-2 mt-4 rounded w-full"
//                 disabled={loading}
//             >
//                 {loading ? 'Scraping...' : 'Scrape'}
//             </button>

//             {/* Error Message */}
//             {error && (
//                 <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
//                     {error}
//                 </div>
//             )}

//             {/* Display Scraped Data */}
//             {result && (
//                 <div className="mt-8 p-4 bg-gray-100 rounded overflow-auto max-h-96">
//                     <h2 className="text-xl font-semibold">Scraped Data:</h2>
//                     <pre className="mt-4 whitespace-pre-wrap">
//                         {JSON.stringify(result, null, 2)}
//                     </pre>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Scraper;
import React, { useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';

const Scraper = () => {
    const [url, setUrl] = useState('');
    const [types, setTypes] = useState({
        text: false,
        html: false,
        images: false,
        links: false,
        structuredData: false
    });
    const [result, setResult] = useState(null);
    const [isScraping, setIsScraping] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleCheckboxChange = (event) => {
        setTypes({
            ...types,
            [event.target.name]: event.target.checked
        });
    };

    const handleSubmit = async () => {
        setIsScraping(true);
        setErrorMessage('');
        setResult(null);
        try {
            const response = await axios.post('http://localhost:5000/scrape', {
                url,
                types: Object.keys(types).filter(key => types[key])
            });
            setResult(response.data);
        } catch (error) {
            console.error('Error:', error);
            setErrorMessage('Failed to scrape the URL. Please check the link and try again.');
        } finally {
            setIsScraping(false);
        }
    };

    const handleDownloadCSV = () => {
        if (result) {
            const csvContent = Object.keys(result.data)
                .map(key => `${key},${result.data[key]}`)
                .join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, 'scraped_data.csv');
        }
    };

    return (
        <div className="p-4 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-center">Web Scraper</h1>

            <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL"
                className="border p-2 w-full mt-4"
            />

            <div className="mt-4">
                <h2 className="text-xl font-semibold">Select Data Types to Scrape:</h2>
                <div className="flex flex-col space-y-2 mt-2">
                    <label>
                        <input
                            type="checkbox"
                            name="text"
                            checked={types.text}
                            onChange={handleCheckboxChange}
                        />
                        <span className="ml-2">Text</span>
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="html"
                            checked={types.html}
                            onChange={handleCheckboxChange}
                        />
                        <span className="ml-2">HTML</span>
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="images"
                            checked={types.images}
                            onChange={handleCheckboxChange}
                        />
                        <span className="ml-2">Images</span>
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="links"
                            checked={types.links}
                            onChange={handleCheckboxChange}
                        />
                        <span className="ml-2">Links</span>
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name="structuredData"
                            checked={types.structuredData}
                            onChange={handleCheckboxChange}
                        />
                        <span className="ml-2">Structured Data</span>
                    </label>
                </div>
            </div>

            <div className="flex justify-center items-center h-full">
    <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white py-3 mt-10 rounded w-1/2"
        disabled={isScraping}
    >
        {isScraping ? 'Scraping...' : 'Scrape'}
    </button>
</div>



            {errorMessage && (
                <div className="text-red-500 mt-4 text-center">{errorMessage}</div>
            )}

            {result && (
                <div className="mt-8 p-4 bg-gray-100 rounded overflow-auto max-h-96">
                   <h2 className="text-xl font-semibold text-green-500">Scraped Data:</h2>
                    <pre className="mt-4 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}

            {result && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={handleDownloadCSV}
                        className="bg-green-500 text-white p-2 rounded text-sm"
                    >
                        Download CSV
                    </button>
                </div>
            )}
        </div>
    );
};

export default Scraper;
