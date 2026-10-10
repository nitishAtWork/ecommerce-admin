import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ArrowLeft,
    Globe2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import countryService from "../../services/country.service";

const countrySchema = z.object({
    name: z
        .string()
        .trim()
        .min(
            2,
            "Country name is required."
        )
        .max(
            100,
            "Country name cannot exceed 100 characters."
        ),
});

function AddCountry() {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm({
        resolver: zodResolver(
            countrySchema
        ),
        defaultValues: {
            name: "",
        },
    });

    const onSubmit = async (values) => {
        try {
            await countryService.createCountry({
                name: values.name.trim(),
                isActive: true,
            });

            toast.success(
                "Country created successfully."
            );

            // navigate(
            //     "/admin/locations/countries",
            //     {
            //         replace: true,
            //     }
            // );
            // reset form
            setValue("name", "");
        } catch (error) {
            console.error(
                "Create country error:",
                error
            );

            toast.error(
                error?.response?.data?.message ||
                    "Failed to create country."
            );
        }
    };

    return (
        <div>
            <PageHeader
                title="Add Country"
                description="Add a new country to your store."
                action={
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() =>
                            navigate(
                                "/admin/locations/countries"
                            )
                        }
                    >
                        <ArrowLeft
                            size={17}
                        />
                        Back to Countries
                    </Button>
                }
            />

            <form
                onSubmit={handleSubmit(
                    onSubmit
                )}
                className="space-y-6"
            >
                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                                <Globe2
                                    size={20}
                                />
                            </div>

                            <div>
                                <h2 className="font-semibold text-slate-900">
                                    Country Information
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Enter the country name.
                                    The slug will be generated
                                    automatically.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5">
                        <Input
                            label="Country Name"
                            name="name"
                            placeholder="Enter country name"
                            required
                            error={
                                errors.name
                                    ?.message
                            }
                            {...register(
                                "name"
                            )}
                        />
                    </div>
                </section>

                {/* Sticky Actions */}
                <div className="sticky bottom-0 z-30 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
                    <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={
                                isSubmitting
                            }
                            onClick={() =>
                                navigate(
                                    "/admin/locations/countries"
                                )
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            loading={
                                isSubmitting
                            }
                            disabled={
                                isSubmitting
                            }
                        >
                            Create Country
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default AddCountry;