import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
export default function NotFound() {
    return (_jsx("div", { className: "not-found-page", children: _jsxs("div", { className: "not-found-content", children: [_jsx("div", { className: "not-found-icon", children: _jsx(AlertCircle, { className: "h-16 w-16" }) }), _jsx("h2", { children: "404 - Page Not Found" }), _jsx("p", { children: "The page you are looking for does not exist. It might have been moved or deleted." }), _jsx(Link, { to: "/", className: "back-link", children: "Return to Home Page" })] }) }));
}
