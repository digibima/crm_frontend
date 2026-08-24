import { useState } from "react";

export default function Quotations() {
    // Mock data mapping the exact layout and rows from image_eaa2c9.png
    const [quotes] = useState([
        {
            id: 1,
            client: "Priya Mehta",
            category: "Health",
            insurer: "Star Health",
            premium: "₹12,400/yr",
            generated: "Mar 28",
            sent: "Yes",
            status: "Converted",
        },
        {
            id: 2,
            client: "Ramesh Gupta",
            category: "Motor",
            insurer: "HDFC Ergo",
            premium: "₹4,800/yr",
            generated: "Mar 29",
            sent: "Yes",
            status: "Follow-up",
        },
        {
            id: 3,
            client: "Kavita Singh",
            category: "Life/Term",
            insurer: "LIC",
            premium: "₹9,200/yr",
            generated: "Mar 30",
            sent: "Yes",
            status: "Awaiting",
        },
    ]);

    const getCategoryStyles = (category) => {
        switch (category) {
            case "Health":
                return "bg-teal-50 text-teal-700 border-teal-100";
            case "Motor":
                return "bg-amber-50 text-amber-700 border-amber-100";
            case "Life/Term":
                return "bg-indigo-50 text-indigo-700 border-indigo-100";
            default:
                return "bg-gray-50 text-gray-600 border-gray-100";
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case "Converted":
                return "bg-emerald-50 text-emerald-700 border-emerald-100";
            case "Follow-up":
                return "bg-amber-50 text-amber-700 border-amber-100";
            case "Awaiting":
                return "bg-slate-100 text-slate-400 border-transparent";
            default:
                return "bg-gray-50 text-gray-500 border-gray-100";
        }
    };

    return (
        <div className="space-y-6">

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quotations</h1>
                <p className="text-gray-400 text-sm mt-0.5 font-medium">
                    All quotes generated and sent
                </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                <th className="py-4 px-6">Client</th>
                                <th className="py-4 px-6">Category</th>
                                <th className="py-4 px-6">Insurer</th>
                                <th className="py-4 px-6">Premium</th>
                                <th className="py-4 px-6">Generated</th>
                                <th className="py-4 px-6">Sent</th>
                                <th className="py-4 px-6">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                            {quotes.map((quote) => (
                                <tr
                                    key={quote.id}
                                    className="hover:bg-slate-50/50 transition duration-150"
                                >
                                    <td className="py-4 px-6 font-bold text-slate-800">
                                        {quote.client}
                                    </td>

                                    <td className="py-4 px-6">
                                        <span
                                            className={`px-3 py-1 text-[11px] font-bold rounded-lg border uppercase tracking-wider ${getCategoryStyles(
                                                quote.category
                                            )}`}
                                        >
                                            {quote.category}
                                        </span>
                                    </td>

                                    <td className="py-4 px-6 text-slate-600 font-semibold">
                                        {quote.insurer}
                                    </td>

                                    <td className="py-4 px-6 text-slate-700 font-bold">
                                        {quote.premium}
                                    </td>

                                    <td className="py-4 px-6 text-gray-400 font-medium">
                                        {quote.generated}
                                    </td>

                                    <td className="py-4 px-6">
                                        <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-lg border border-emerald-100 font-semibold">
                                            {quote.sent}
                                        </span>
                                    </td>

                                    <td className="py-4 px-6">
                                        <span
                                            className={`inline-block text-center text-xs font-bold px-3 py-1 rounded-lg border min-w-[90px] ${getStatusStyles(
                                                quote.status
                                            )}`}
                                        >
                                            {quote.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}