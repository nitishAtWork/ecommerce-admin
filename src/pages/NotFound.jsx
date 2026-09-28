import React from "react";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg text-center">
        {/* Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50">
          <SearchX
            size={40}
            strokeWidth={1.7}
            className="text-blue-600"
          />
        </div>

        {/* 404 */}
        <h1 className="mt-8 text-8xl font-bold tracking-tight text-slate-900">
          404
        </h1>

        {/* Heading */}
        <h2 className="mt-4 text-2xl font-semibold text-slate-800">
          Page not found
        </h2>

        {/* Description */}
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
          Sorry, the page you are looking for doesn't
          exist or may have been moved to another
          location.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <ArrowLeft size={17} />
            Go Back
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Home size={17} />
            Go Home
          </button>
        </div>

        {/* Small footer text */}
        <p className="mt-10 text-xs text-slate-400">
          Error 404 · Page not found
        </p>
      </div>
    </div>
  );
};

export default NotFound;