import {
    ArrowLeft,
    Edit,
    ImageIcon,
    Tag,
    FileText,
    Globe,
    CheckCircle2,
    XCircle,
    HelpCircle,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/ui/Button";

import keywordService from "../../services/keyword.service";

import { getImageUrl } from "../../utils/getImageUrl";

function KeywordDetails() {
    const navigate = useNavigate();

    const { id } = useParams();

    /* =========================================================
       LOAD KEYWORD
    ========================================================= */

    const {
        data,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: [
            "keyword",
            id,
        ],

        queryFn: () =>
            keywordService.getKeywordById(id),

        enabled: Boolean(id),
    });

    /* =========================================================
       LOADING
    ========================================================= */

    if (isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center text-sm text-slate-500">
                Loading keyword...
            </div>
        );
    }

    /* =========================================================
       ERROR
    ========================================================= */

    if (isError) {
        return (
            <div>
                <PageHeader
                    title="Keyword Details"
                    description="Unable to load keyword."
                />

                <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
                    {error?.response?.data?.message ||
                        "Keyword not found."}
                </div>
            </div>
        );
    }

    /* =========================================================
       KEYWORD DATA
    ========================================================= */

    const keyword =
        data?.data?.keyword ||
        data?.keyword;

    if (!keyword) {
        return (
            <div>
                <PageHeader
                    title="Keyword Details"
                    description="Keyword not found."
                />
            </div>
        );
    }

    /* =========================================================
       MAIN IMAGE
    ========================================================= */

    const mainImage =
        keyword.img ||
        keyword.images?.[0];

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div>
            {/* =====================================================
                HEADER
            ===================================================== */}

            <PageHeader
                title="Keyword Details"
                description="View keyword information."
                action={
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={() =>
                                navigate(
                                    "/admin/keywords"
                                )
                            }
                        >
                            <ArrowLeft size={17} />
                            Back
                        </Button>

                        <Button
                            onClick={() =>
                                navigate(
                                    `/admin/keywords/${id}/edit`
                                )
                            }
                        >
                            <Edit size={17} />
                            Edit Keyword
                        </Button>
                    </div>
                }
            />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* =================================================
                    IMAGES
                ================================================= */}

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
                    {/* Main image */}

                    <div className="aspect-square overflow-hidden rounded-xl bg-slate-100">
                        {mainImage ? (
                            <img
                                src={getImageUrl(
                                    mainImage
                                )}
                                alt={keyword.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-400">
                                <ImageIcon
                                    size={48}
                                />
                            </div>
                        )}
                    </div>

                    {/* Additional images */}

                    {keyword.images?.length >
                        0 && (
                        <div className="mt-4 grid grid-cols-4 gap-2">
                            {keyword.images.map(
                                (
                                    image,
                                    index
                                ) => (
                                    <div
                                        key={`${image}-${index}`}
                                        className="aspect-square overflow-hidden rounded-lg border border-slate-200"
                                    >
                                        <img
                                            src={getImageUrl(
                                                image
                                            )}
                                            alt={`${keyword.name} ${
                                                index +
                                                1
                                            }`}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* =================================================
                    KEYWORD INFORMATION
                ================================================= */}

                <div className="space-y-6 lg:col-span-2">
                    {/* ---------------------------------------------
                        BASIC INFORMATION
                    --------------------------------------------- */}

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        {keyword.name}
                                    </h2>

                                    {keyword.size && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                            <Tag
                                                size={
                                                    13
                                                }
                                            />

                                            {
                                                keyword.size
                                            }
                                        </span>
                                    )}
                                </div>

                                {keyword.slug && (
                                    <p className="mt-1 text-sm text-slate-500">
                                        /{keyword.slug}
                                    </p>
                                )}
                            </div>

                            <span
                                className={
                                    keyword.isActive
                                        ? "inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                                        : "inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500"
                                }
                            >
                                {keyword.isActive ? (
                                    <CheckCircle2
                                        size={14}
                                    />
                                ) : (
                                    <XCircle
                                        size={14}
                                    />
                                )}

                                {keyword.isActive
                                    ? "Active"
                                    : "Inactive"}
                            </span>
                        </div>

                        <div className="mt-6">
                            {/* Short description */}

                            {keyword.shortDescription && (
                                <div>
                                    <p className="text-sm leading-6 text-slate-600">
                                        {
                                            keyword.shortDescription
                                        }
                                    </p>
                                </div>
                            )}

                            {/* Description */}

                            <div className="mt-5 border-t border-slate-100 pt-5">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                    <FileText
                                        size={16}
                                    />

                                    Description
                                </h3>

                                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                                    {keyword.description ||
                                        "-"}
                                </p>
                            </div>

                            {/* Extra Description */}

                            {keyword.extraDescription && (
                                <div className="mt-5 border-t border-slate-100 pt-5">
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        Extra Description
                                    </h3>

                                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                                        {
                                            keyword.extraDescription
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* =================================================
                        KEYWORD STATS
                    ================================================= */}

                    <div className="grid gap-4 sm:grid-cols-3">
                        {/* Size */}

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <Tag
                                        size={19}
                                    />
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">
                                        Size
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-900">
                                        {keyword.size ||
                                            "-"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* FAQ */}

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                                    <HelpCircle
                                        size={
                                            19
                                        }
                                    />
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">
                                        FAQs
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-900">
                                        {Array.isArray(
                                            keyword.faqs
                                        )
                                            ? keyword
                                                  .faqs
                                                  .length
                                            : 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Images */}

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                                    <ImageIcon
                                        size={
                                            19
                                        }
                                    />
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">
                                        Images
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-900">
                                        {(keyword.img
                                            ? 1
                                            : 0) +
                                            (Array.isArray(
                                                keyword.images
                                            )
                                                ? keyword
                                                      .images
                                                      .length
                                                : 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        KEYWORD INFORMATION
                    ================================================= */}

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="font-semibold text-slate-900">
                            Keyword Information
                        </h3>

                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <InfoItem
                                label="Keyword ID"
                                value={
                                    keyword._id
                                }
                            />

                            <InfoItem
                                label="Slug"
                                value={
                                    keyword.slug
                                }
                            />

                            <InfoItem
                                label="Size"
                                value={
                                    keyword.size
                                }
                            />

                            <InfoItem
                                label="Icon"
                                value={
                                    keyword.icon
                                }
                            />

                            <InfoItem
                                label="Status"
                                value={
                                    keyword.isActive
                                        ? "Active"
                                        : "Inactive"
                                }
                            />

                            <InfoItem
                                label="Created"
                                value={
                                    keyword.createdAt
                                        ? formatDate(
                                              keyword.createdAt
                                          )
                                        : "-"
                                }
                            />

                            <InfoItem
                                label="Updated"
                                value={
                                    keyword.updatedAt
                                        ? formatDate(
                                              keyword.updatedAt
                                          )
                                        : "-"
                                }
                            />
                        </div>
                    </div>

                    {/* =================================================
                        FAQ / faqs
                    ================================================= */}

                    {Array.isArray(
                        keyword.faqs
                    ) &&
                        keyword.faqs
                            .length > 0 && (
                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div>
                                    <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                                        <HelpCircle
                                            size={
                                                18
                                            }
                                        />

                                        faqs / FAQ
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Questions and answers for
                                        this keyword.
                                    </p>
                                </div>

                                <div className="mt-5 space-y-4">
                                    {keyword.faqs.map(
                                        (
                                            item,
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    index
                                                }
                                                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                                            >
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {
                                                        item.question
                                                    }
                                                </p>

                                                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                                                    {
                                                        item.answer
                                                    }
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                    {/* =================================================
                        SEO INFORMATION
                    ================================================= */}

                    {(keyword.metaTitle ||
                        keyword.metaDescription ||
                        keyword.metaKeywords) && (
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div>
                                <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                                    <Globe
                                        size={18}
                                    />

                                    SEO Information
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Search engine metadata for this
                                    keyword.
                                </p>
                            </div>

                            <div className="mt-5 space-y-5">
                                <InfoItem
                                    label="Meta Title"
                                    value={
                                        keyword.metaTitle
                                    }
                                />

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Meta Description
                                    </p>

                                    <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
                                        {keyword.metaDescription ||
                                            "-"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Meta Keywords
                                    </p>

                                    <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
                                        {keyword.metaKeywords ||
                                            "-"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
    label,
    value,
}) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-1 break-all text-sm text-slate-700">
                {value || "-"}
            </p>
        </div>
    );
}

/* =========================================================
   DATE FORMATTER
========================================================= */

function formatDate(value) {
    try {
        return new Date(value).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    } catch {
        return "-";
    }
}

export default KeywordDetails;