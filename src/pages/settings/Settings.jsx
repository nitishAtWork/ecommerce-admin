import { useEffect, useState } from "react";
import {
    Globe,
    ImagePlus,
    Mail,
    Phone,
    MapPin,
    Share2,
    Search,
    Settings2,
    Save,
    X,
} from "lucide-react";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    useForm,
} from "react-hook-form";
import {
    z,
} from "zod";
import {
    zodResolver,
} from "@hookform/resolvers/zod";
import {
    toast,
} from "sonner";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";

import websiteService from "../../services/website.service";
import {
    getImageUrl,
} from "../../utils/getImageUrl";


/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

const websiteSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Website name is required."),

    tagLine: z
        .string()
        .trim()
        .optional(),

    footerText: z
        .string()
        .trim()
        .optional(),

    copyrightText: z
        .string()
        .trim()
        .optional(),

    googleMap: z
        .string()
        .trim()
        .optional(),

    primaryEmail: z
        .string()
        .trim()
        .email("Enter a valid primary email."),

    secondaryEmail: z
        .string()
        .trim()
        .email("Enter a valid email.")
        .or(z.literal("")),

    thirdEmail: z
        .string()
        .trim()
        .email("Enter a valid email.")
        .or(z.literal("")),

    fourthEmail: z
        .string()
        .trim()
        .email("Enter a valid email.")
        .or(z.literal("")),

    primaryPhone: z
        .string()
        .trim()
        .min(1, "Primary phone is required."),

    secondaryPhone: z
        .string()
        .trim()
        .optional(),

    thirdPhone: z
        .string()
        .trim()
        .optional(),

    fourthPhone: z
        .string()
        .trim()
        .optional(),

    primaryAddress: z
        .string()
        .trim()
        .min(1, "Primary address is required."),

    secondaryAddress: z
        .string()
        .trim()
        .optional(),

    thirdAddress: z
        .string()
        .trim()
        .optional(),

    fourthAddress: z
        .string()
        .trim()
        .optional(),

    facebook: z
        .string()
        .trim()
        .optional(),

    linkedin: z
        .string()
        .trim()
        .optional(),

    twitter: z
        .string()
        .trim()
        .optional(),

    instagram: z
        .string()
        .trim()
        .optional(),

    pinterest: z
        .string()
        .trim()
        .optional(),

    youtube: z
        .string()
        .trim()
        .optional(),

    tumblr: z
        .string()
        .trim()
        .optional(),

    whatsapp: z
        .string()
        .trim()
        .optional(),

    domain: z
        .string()
        .trim()
        .optional(),

    googleAnalytics: z
        .string()
        .trim()
        .optional(),

    googleSearchConsole: z
        .string()
        .trim()
        .optional(),
});


function Settings() {
    const queryClient =
        useQueryClient();

    const [logo, setLogo] =
        useState(null);

    const [favicon, setFavicon] =
        useState(null);

    const [logoPreview, setLogoPreview] =
        useState("");

    const [faviconPreview, setFaviconPreview] =
        useState("");

    const [robots, setRobots] =
        useState(true);

    const [panIndia, setPanIndia] =
        useState(false);


    const {
        register,
        reset,
        handleSubmit,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm({
        resolver: zodResolver(
            websiteSchema
        ),

        defaultValues: {
            name: "",
            tagLine: "",
            footerText: "",
            copyrightText: "",
            googleMap: "",

            primaryEmail: "",
            secondaryEmail: "",
            thirdEmail: "",
            fourthEmail: "",

            primaryPhone: "",
            secondaryPhone: "",
            thirdPhone: "",
            fourthPhone: "",

            primaryAddress: "",
            secondaryAddress: "",
            thirdAddress: "",
            fourthAddress: "",

            facebook: "",
            linkedin: "",
            twitter: "",
            instagram: "",
            pinterest: "",
            youtube: "",
            tumblr: "",
            whatsapp: "",

            domain: "",
            googleAnalytics: "",
            googleSearchConsole: "",
        },
    });


    /*
    |--------------------------------------------------------------------------
    | Get Website Settings
    |--------------------------------------------------------------------------
    */

    const {
        data,
        isLoading,
        isError,
    } = useQuery({
        queryKey: [
            "website-settings",
        ],

        queryFn:
            websiteService.getSettings,
    });

    // console.log("Website settings data:", data);


    /*
    |--------------------------------------------------------------------------
    | Populate Form
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!data) {
            return;
        }

        const website =
            data?.data?.website ||
            data?.website ||
            data?.data;

        if (!website) {
            return;
        }

        reset({
            name:
                website.name || "",

            tagLine:
                website.tagLine || "",

            footerText:
                website.footerText || "",

            copyrightText:
                website.copyrightText || "",

            googleMap:
                website.googleMap || "",

            primaryEmail:
                website.primaryEmail || "",

            secondaryEmail:
                website.secondaryEmail || "",

            thirdEmail:
                website.thirdEmail || "",

            fourthEmail:
                website.fourthEmail || "",

            primaryPhone:
                website.primaryPhone || "",

            secondaryPhone:
                website.secondaryPhone || "",

            thirdPhone:
                website.thirdPhone || "",

            fourthPhone:
                website.fourthPhone || "",

            primaryAddress:
                website.primaryAddress || "",

            secondaryAddress:
                website.secondaryAddress || "",

            thirdAddress:
                website.thirdAddress || "",

            fourthAddress:
                website.fourthAddress || "",

            facebook:
                website.facebook || "",

            linkedin:
                website.linkedin || "",

            twitter:
                website.twitter || "",

            instagram:
                website.instagram || "",

            pinterest:
                website.pinterest || "",

            youtube:
                website.youtube || "",

            tumblr:
                website.tumblr || "",

            whatsapp:
                website.whatsapp || "",

            domain:
                website.domain || "",

            googleAnalytics:
                website.googleAnalytics || "",

            googleSearchConsole:
                website.googleSearchConsole || "",
        });

        setRobots(
            website.robots !== false
        );

        setPanIndia(
            Boolean(website.panIndia)
        );

        if (website.logo) {
            setLogoPreview(
                getImageUrl(
                    website.logo
                )
            );
        }

        if (website.favicon) {
            setFaviconPreview(
                getImageUrl(
                    website.favicon
                )
            );
        }
    }, [
        data,
        reset,
    ]);


    /*
    |--------------------------------------------------------------------------
    | Logo
    |--------------------------------------------------------------------------
    */

    const handleLogoChange = (
        event
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        setLogo(file);

        setLogoPreview(
            URL.createObjectURL(file)
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Favicon
    |--------------------------------------------------------------------------
    */

    const handleFaviconChange = (
        event
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        setFavicon(file);

        setFaviconPreview(
            URL.createObjectURL(file)
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Save Settings
    |--------------------------------------------------------------------------
    */

    const mutation = useMutation({
        mutationFn: (formData) =>
            websiteService.updateSettings(formData),

        onSuccess: () => {
            toast.success(
                "Website settings updated successfully."
            );

            queryClient.invalidateQueries({
                queryKey: ["website-settings"],
            });
        },

        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                "Failed to update website settings."
            );
        },
    });


    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const onSubmit = async (
        values
    ) => {
        const formData =
            new FormData();

        Object.entries(values).forEach(
            ([key, value]) => {
                formData.append(
                    key,
                    value ?? ""
                );
            }
        );

        formData.append(
            "robots",
            String(robots)
        );

        formData.append(
            "panIndia",
            String(panIndia)
        );

        if (logo) {
            formData.append(
                "logo",
                logo
            );
        }

        if (favicon) {
            formData.append(
                "favicon",
                favicon
            );
        }

        await mutation.mutateAsync(
            formData
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-sm text-slate-500">
                    Loading website settings...
                </div>
            </div>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    if (isError) {
        return (
            <div>
                <PageHeader
                    title="Website Settings"
                    description="Manage your website configuration."
                />

                <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
                    Unable to load website settings.
                </div>
            </div>
        );
    }


    return (
        <div className="pb-10">

            <PageHeader
                title="Website Settings"
                description="Manage your website information, contact details, social media and SEO settings."
            />


            <form
                onSubmit={handleSubmit(
                    onSubmit
                )}
                className="space-y-6"
            >

                {/* =========================================================
            WEBSITE INFORMATION
        ========================================================= */}

                <SettingsSection
                    icon={<Globe size={20} />}
                    title="Website Information"
                    description="Basic information displayed across your website."
                >

                    <div className="grid gap-5 md:grid-cols-2">

                        <Input
                            label="Website Name"
                            required
                            error={
                                errors.name?.message
                            }
                            {...register("name")}
                        />

                        <Input
                            label="Tagline"
                            error={
                                errors.tagLine?.message
                            }
                            {...register("tagLine")}
                        />

                    </div>

                </SettingsSection>


                {/* =========================================================
            LOGO & FAVICON
        ========================================================= */}

                <SettingsSection
                    icon={<ImagePlus size={20} />}
                    title="Logo & Favicon"
                    description="Upload your website logo and browser favicon."
                >

                    <div className="grid gap-8 md:grid-cols-2">

                        <ImageUpload
                            label="Website Logo"
                            preview={logoPreview}
                            accept="image/png,image/jpeg,image/avif,image/webp, image/svg+xml"
                            onChange={
                                handleLogoChange
                            }
                            onRemove={() => {
                                setLogo(null);
                                setLogoPreview("");
                            }}
                        />

                        <ImageUpload
                            label="Favicon"
                            preview={faviconPreview}
                            accept="image/png,image/x-icon,image/svg+xml,image/jpeg"
                            onChange={
                                handleFaviconChange
                            }
                            onRemove={() => {
                                setFavicon(null);
                                setFaviconPreview("");
                            }}
                        />

                    </div>

                </SettingsSection>


                {/* =========================================================
            FOOTER
        ========================================================= */}

                <SettingsSection
                    title="Footer"
                    description="Configure the content displayed in the website footer."
                >

                    <div className="space-y-5">

                        <Textarea
                            label="Footer Text"
                            rows={3}
                            {...register(
                                "footerText"
                            )}
                        />

                        <Input
                            label="Copyright Text"
                            {...register(
                                "copyrightText"
                            )}
                        />

                    </div>

                </SettingsSection>


                {/* =========================================================
            EMAILS
        ========================================================= */}

                <SettingsSection
                    icon={<Mail size={20} />}
                    title="Email Addresses"
                    description="Manage the email addresses used by your website."
                >

                    <div className="grid gap-5 md:grid-cols-2">

                        <Input
                            label="Primary Email"
                            type="email"
                            required
                            error={
                                errors.primaryEmail
                                    ?.message
                            }
                            {...register(
                                "primaryEmail"
                            )}
                        />

                        <Input
                            label="Secondary Email"
                            type="email"
                            error={
                                errors.secondaryEmail
                                    ?.message
                            }
                            {...register(
                                "secondaryEmail"
                            )}
                        />

                        <Input
                            label="Third Email"
                            type="email"
                            error={
                                errors.thirdEmail
                                    ?.message
                            }
                            {...register(
                                "thirdEmail"
                            )}
                        />

                        <Input
                            label="Fourth Email"
                            type="email"
                            error={
                                errors.fourthEmail
                                    ?.message
                            }
                            {...register(
                                "fourthEmail"
                            )}
                        />

                    </div>

                </SettingsSection>


                {/* =========================================================
            PHONE
        ========================================================= */}

                <SettingsSection
                    icon={<Phone size={20} />}
                    title="Phone Numbers"
                    description="Manage your business contact numbers."
                >

                    <div className="grid gap-5 md:grid-cols-2">

                        <Input
                            label="Primary Phone"
                            required
                            error={
                                errors.primaryPhone
                                    ?.message
                            }
                            {...register(
                                "primaryPhone"
                            )}
                        />

                        <Input
                            label="Secondary Phone"
                            {...register(
                                "secondaryPhone"
                            )}
                        />

                        <Input
                            label="Third Phone"
                            {...register(
                                "thirdPhone"
                            )}
                        />

                        <Input
                            label="Fourth Phone"
                            {...register(
                                "fourthPhone"
                            )}
                        />

                    </div>

                </SettingsSection>


                {/* =========================================================
            ADDRESSES
        ========================================================= */}

                <SettingsSection
                    icon={<MapPin size={20} />}
                    title="Addresses"
                    description="Manage your business addresses."
                >

                    <div className="space-y-5">

                        <Textarea
                            label="Primary Address"
                            required
                            rows={3}
                            error={
                                errors.primaryAddress
                                    ?.message
                            }
                            {...register(
                                "primaryAddress"
                            )}
                        />

                        <Textarea
                            label="Secondary Address"
                            rows={3}
                            {...register(
                                "secondaryAddress"
                            )}
                        />

                        <Textarea
                            label="Third Address"
                            rows={3}
                            {...register(
                                "thirdAddress"
                            )}
                        />

                        <Textarea
                            label="Fourth Address"
                            rows={3}
                            {...register(
                                "fourthAddress"
                            )}
                        />

                    </div>

                </SettingsSection>


                {/* =========================================================
            GOOGLE MAP
        ========================================================= */}

                <SettingsSection
                    icon={<MapPin size={20} />}
                    title="Google Maps"
                    description="Configure the Google Maps embed URL or map location."
                >

                    <Textarea
                        label="Google Map"
                        rows={4}
                        placeholder="Paste Google Maps embed URL or map code"
                        {...register(
                            "googleMap"
                        )}
                    />

                </SettingsSection>


                {/* =========================================================
            SOCIAL MEDIA
        ========================================================= */}

                <SettingsSection
                    icon={<Share2 size={20} />}
                    title="Social Media"
                    description="Configure your social media profile URLs."
                >

                    <div className="grid gap-5 md:grid-cols-2">

                        <Input
                            label="Facebook"
                            placeholder="https://facebook.com/..."
                            {...register(
                                "facebook"
                            )}
                        />

                        <Input
                            label="LinkedIn"
                            placeholder="https://linkedin.com/..."
                            {...register(
                                "linkedin"
                            )}
                        />

                        <Input
                            label="Twitter / X"
                            placeholder="https://x.com/..."
                            {...register(
                                "twitter"
                            )}
                        />

                        <Input
                            label="Instagram"
                            placeholder="https://instagram.com/..."
                            {...register(
                                "instagram"
                            )}
                        />

                        <Input
                            label="Pinterest"
                            placeholder="https://pinterest.com/..."
                            {...register(
                                "pinterest"
                            )}
                        />

                        <Input
                            label="YouTube"
                            placeholder="https://youtube.com/..."
                            {...register(
                                "youtube"
                            )}
                        />

                        <Input
                            label="Tumblr"
                            placeholder="https://tumblr.com/..."
                            {...register(
                                "tumblr"
                            )}
                        />

                        <Input
                            label="WhatsApp"
                            placeholder="WhatsApp number or URL"
                            {...register(
                                "whatsapp"
                            )}
                        />

                    </div>

                </SettingsSection>


                {/* =========================================================
            SEO
        ========================================================= */}

                <SettingsSection
                    icon={<Search size={20} />}
                    title="Website & SEO"
                    description="Configure your domain and Google services."
                >

                    <div className="grid gap-5 md:grid-cols-2">

                        <Input
                            label="Domain"
                            placeholder="https://example.com"
                            {...register(
                                "domain"
                            )}
                        />

                        <Input
                            label="Google Analytics"
                            placeholder="Measurement ID / tracking ID"
                            {...register(
                                "googleAnalytics"
                            )}
                        />

                        <Input
                            label="Google Search Console"
                            placeholder="Verification code"
                            {...register(
                                "googleSearchConsole"
                            )}
                        />

                    </div>

                </SettingsSection>


                {/* =========================================================
            WEBSITE OPTIONS
        ========================================================= */}

                <SettingsSection
                    icon={<Settings2 size={20} />}
                    title="Website Options"
                    description="Control website-wide settings."
                >

                    <div className="space-y-4">

                        <Toggle
                            title="Robots"
                            description="Allow search engines to crawl and index the website."
                            checked={robots}
                            onChange={
                                setRobots
                            }
                        />

                        <Toggle
                            title="Pan India"
                            description="Enable services or delivery across India."
                            checked={panIndia}
                            onChange={
                                setPanIndia
                            }
                        />

                    </div>

                </SettingsSection>


                {/* =========================================================
            API ID
        ========================================================= */}

                <SettingsSection
                    title="Internal Information"
                    description="Internal website identifier."
                >

                    <Input
                        label="API ID"
                        disabled
                        value={
                            data?.data?.website
                                ?.apiId ||
                            data?.website
                                ?.apiId ||
                            data?.data?.apiId ||
                            ""
                        }
                    />

                    <p className="mt-2 text-xs text-slate-400">
                        This identifier is managed internally and cannot be edited.
                    </p>

                </SettingsSection>


                {/* =========================================================
            SAVE
        ========================================================= */}

                <div className="sticky bottom-0 z-20 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">

                    <div className="flex justify-end">

                        <Button
                            type="submit"
                            loading={
                                isSubmitting ||
                                mutation.isPending
                            }
                            disabled={
                                isSubmitting ||
                                mutation.isPending
                            }
                        >
                            <Save size={17} />
                            Save Settings
                        </Button>

                    </div>

                </div>

            </form>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| Settings Section
|--------------------------------------------------------------------------
*/

function SettingsSection({
    icon,
    title,
    description,
    children,
}) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-start gap-3 border-b border-slate-200 px-5 py-4">

                {icon && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        {icon}
                    </div>
                )}

                <div>

                    <h2 className="font-semibold text-slate-900">
                        {title}
                    </h2>

                    {description && (
                        <p className="mt-1 text-sm text-slate-500">
                            {description}
                        </p>
                    )}

                </div>

            </div>

            <div className="p-5">
                {children}
            </div>

        </section>
    );
}


/*
|--------------------------------------------------------------------------
| Image Upload
|--------------------------------------------------------------------------
*/

function ImageUpload({
    label,
    preview,
    accept,
    onChange,
    onRemove,
}) {
    return (
        <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>

            {preview ? (
                <div className="relative flex min-h-40 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4">

                    <img
                        src={preview}
                        alt={label}
                        className="max-h-32 max-w-full object-contain"
                    />

                    <button
                        type="button"
                        onClick={onRemove}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-600 shadow hover:bg-red-50"
                    >
                        <X size={16} />
                    </button>

                </div>
            ) : (
                <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-blue-400 hover:bg-blue-50">

                    <ImagePlus
                        size={30}
                        className="text-slate-400"
                    />

                    <span className="mt-2 text-sm font-medium text-slate-600">
                        Upload {label}
                    </span>

                    <span className="mt-1 text-xs text-slate-400">
                        PNG, JPG, WEBP or SVG
                    </span>

                    <input
                        type="file"
                        accept={accept}
                        className="hidden"
                        onChange={onChange}
                    />

                </label>
            )}

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| Toggle
|--------------------------------------------------------------------------
*/

function Toggle({
    title,
    description,
    checked,
    onChange,
}) {
    return (
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4">

            <div>

                <p className="text-sm font-medium text-slate-900">
                    {title}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                    {description}
                </p>

            </div>

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() =>
                    onChange(!checked)
                }
                className={`relative h-6 w-11 rounded-full transition ${checked
                        ? "bg-blue-600"
                        : "bg-slate-300"
                    }`}
            >

                <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${checked
                            ? "left-6"
                            : "left-1"
                        }`}
                />

            </button>

        </label>
    );
}


export default Settings;