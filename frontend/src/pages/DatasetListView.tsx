// // DatasetListView.tsx
// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { authenticatedFetch } from '../utils/api';

// type Dataset = {
//   id: number;
//   name: string;
//   completionPercentage: number;
//   classes: string;
//   description?: string;
// };

// export default function DatasetListView() {
//   const [datasets, setDatasets] = useState<Dataset[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchDatasets = async () => {
//       try {
//         const response = await authenticatedFetch('/api/admin/datasets/list');
//         const data = await response.json();
//         setDatasets(data);
//       } catch (error) {
//         console.error('Error fetching datasets:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchDatasets();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6">
//       <h2 className="text-2xl font-bold text-gray-800 mb-6">Liste des Datasets</h2>
      
//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Avancement</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {datasets.map((dataset) => (
//               <tr key={dataset.id}>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="text-sm font-medium text-gray-900">{dataset.name}</div>
//                   {dataset.description && (
//                     <div className="text-sm text-gray-500">{dataset.description}</div>
//                   )}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex items-center">
//                     <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
//                       <div 
//                         className="bg-teal-600 h-2.5 rounded-full" 
//                         style={{ width: `${dataset.completionPercentage}%` }}
//                       ></div>
//                     </div>
//                     <span className="text-sm text-gray-700">
//                       {Math.round(dataset.completionPercentage)}%
//                     </span>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                   <div className="space-x-2">
//                     <Link
//                       to={`/admin/datasets/${dataset.id}`}
//                       className="text-teal-600 hover:text-teal-900"
//                     >
//                       Détails
//                     </Link>
//                     <Link
//                       to={`/admin/datasets/${dataset.id}/annotators`}
//                       className="text-teal-600 hover:text-teal-900"
//                     >
//                       Affecter
//                     </Link>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }