import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import JoditEditor from "jodit-react";
import { ArrowLeft, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import editorConfig from "../../components/ui/EditorConfig";
import keywordService from "../../services/keyword.service";
import { getImageUrl } from "../../utils/getImageUrl";

const emptyFaq = () => ({ question: "", answer: "" });

const keywordSchema = z.object({
  name: z.string().trim().min(2, "Keyword name must be at least 2 characters."),
  shortDescription: z.string().trim().max(500, "Short description cannot exceed 500 characters.").optional().or(z.literal("")),
  size: z.string().trim().optional().or(z.literal("")),
  icon: z.string().trim().optional().or(z.literal("")),
  metaTitle: z.string().trim().optional().or(z.literal("")),
  metaDescription: z.string().trim().optional().or(z.literal("")),
  metaKeywords: z.string().trim().optional().or(z.literal("")),
});

const initialValues = {
  name: "",
  shortDescription: "",
  size: "",
  icon: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
};

function KeywordForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const descriptionEditor = useRef(null);
  const extraDescriptionEditor = useRef(null);

  const [description, setDescription] = useState("");
  const [extraDescription, setExtraDescription] = useState("");
  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [removedExistingImages, setRemovedExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [faqs, setFaqs] = useState([emptyFaq()]);

  const {
    register,
    reset,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(keywordSchema),
    defaultValues: initialValues,
  });

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["keyword", id],
    queryFn: () => keywordService.getKeywordById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (!isEdit || !data) return;
    const keyword = data?.data?.keyword || data?.keyword || data?.data;
    if (!keyword) return;

    reset({
      name: keyword.name || "",
      shortDescription: keyword.shortDescription || "",
      size: keyword.size || "",
      icon: keyword.icon || "",
      metaTitle: keyword.metaTitle || "",
      metaDescription: keyword.metaDescription || "",
      metaKeywords: keyword.metaKeywords || "",
    });
    setDescription(keyword.description || "");
    setExtraDescription(keyword.extraDescription || "");
    setIsActive(keyword.isActive !== false);
    setFaqs(Array.isArray(keyword.faqs) && keyword.faqs.length
      ? keyword.faqs.map((faq) => ({ question: faq.question || "", answer: faq.answer || "" }))
      : [emptyFaq()]);
    setMainImage(null);
    setMainImagePreview(keyword.img ? getImageUrl(keyword.img) : "");
    setExistingImages(Array.isArray(keyword.images)
      ? keyword.images.filter(Boolean).map((image) => ({ original: image, url: getImageUrl(image) }))
      : []);
    setRemovedExistingImages([]);
    setNewImages([]);
    setNewImagePreviews([]);
  }, [data, isEdit, reset]);

  useEffect(() => () => {
    if (mainImagePreview.startsWith("blob:")) URL.revokeObjectURL(mainImagePreview);
    newImagePreviews.forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });
  }, [mainImagePreview, newImagePreviews]);

  const handleMainImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setMainImage(file);
    setMainImagePreview((previous) => {
      if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });
    event.target.value = "";
  };

  const removeMainImage = () => {
    setMainImage(null);
    setMainImagePreview((previous) => {
      if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
      return "";
    });
  };

  const handleAdditionalImages = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    const remaining = 10 - existingImages.length - newImages.length;
    if (remaining <= 0) {
      toast.error("Maximum 10 additional images allowed.");
      return;
    }

    const selected = files.slice(0, remaining);
    setNewImages((previous) => [...previous, ...selected]);
    setNewImagePreviews((previous) => [
      ...previous,
      ...selected.map((file) => URL.createObjectURL(file)),
    ]);
    if (files.length > remaining) toast.warning(`Only ${remaining} image(s) were added.`);
  };

  const removeExistingImage = (index) => {
    const image = existingImages[index];
    if (!image) return;
    setRemovedExistingImages((previous) => [...previous, image.original]);
    setExistingImages((previous) => previous.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    const preview = newImagePreviews[index];
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setNewImages((previous) => previous.filter((_, i) => i !== index));
    setNewImagePreviews((previous) => previous.filter((_, i) => i !== index));
  };

  const updateFaq = (index, field, value) => {
    setFaqs((previous) => previous.map((faq, i) => i === index ? { ...faq, [field]: value } : faq));
  };

  const onSubmit = async (values) => {
    const validFaqs = faqs.filter((faq) => faq.question.trim() || faq.answer.trim());
    if (validFaqs.some((faq) => !faq.question.trim() || !faq.answer.trim())) {
      toast.error("Please complete both question and answer for each FAQ.");
      return;
    }

    const payload = new FormData();
    Object.entries({
      name: values.name,
      shortDescription: values.shortDescription || "",
      description,
      extraDescription,
      size: values.size || "",
      icon: values.icon || "",
      faqs: JSON.stringify(validFaqs),
      metaTitle: values.metaTitle || "",
      metaDescription: values.metaDescription || "",
      metaKeywords: values.metaKeywords || "",
      isActive: String(isActive),
    }).forEach(([key, value]) => payload.append(key, value));

    if (mainImage) payload.append("img", mainImage);
    newImages.forEach((file) => payload.append("images", file));

    if (isEdit) {
      // Keep these fields aligned with the existing update API contract.
      existingImages.forEach((image) => payload.append("existingImages", image.original));
      removedExistingImages.forEach((image) => payload.append("removeImages", image));
    }

    try {
      if (isEdit) {
        await keywordService.updateKeyword(id, payload);
        toast.success("Keyword updated successfully.");
      } else {
        await keywordService.createKeyword(payload);
        toast.success("Keyword created successfully.");
      }
      navigate("/admin/keywords", { replace: true });
    } catch (err) {
      console.error(`${isEdit ? "Update" : "Create"} keyword error:`, err);
      toast.error(err?.response?.data?.message || `Failed to ${isEdit ? "update" : "create"} keyword.`);
    }
  };

  if (isEdit && isLoading) {
    return <div className="flex min-h-[400px] items-center justify-center gap-2 text-sm text-slate-500"><Loader2 size={18} className="animate-spin" /> Loading keyword...</div>;
  }

  if (isEdit && isError) {
    return <div><PageHeader title="Edit Keyword" description="Unable to load keyword." /><div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">{error?.response?.data?.message || "Keyword could not be loaded."}</div></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit Keyword" : "Add Keyword"}
        description={isEdit ? "Update the keyword landing page and its content." : "Create a new keyword landing page for your store."}
        action={<Button type="button" variant="secondary" onClick={() => navigate("/admin/keywords")}><ArrowLeft size={17} /> Back to Keywords</Button>}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Keyword Information</h2>
            <p className="mt-1 text-sm text-slate-500">Enter the basic information and landing page content.</p>
          </div>
          <div className="space-y-5 p-5">
            <Input label="Keyword Name" name="name" placeholder="Enter keyword name" required error={errors.name?.message} {...register("name")} />
            <Textarea label="Short Description" name="shortDescription" placeholder="Enter a short description" rows={3} error={errors.shortDescription?.message} {...register("shortDescription")} />
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <JoditEditor ref={descriptionEditor} value={description} config={editorConfig} onBlur={(value) => { setDescription(value); setValue("description", value, { shouldDirty: true }); }} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Extra Description</label>
              <JoditEditor ref={extraDescriptionEditor} value={extraDescription} config={editorConfig} onBlur={(value) => { setExtraDescription(value); setValue("extraDescription", value, { shouldDirty: true }); }} />
            </div>
          </div>
        </section>

        {/* <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Keyword Details</h2>
          </div>
          <div className="grid gap-5 p-5 md:grid-cols-2">
            <Input label="Size" name="size" placeholder="e.g. Small, Medium, Large" error={errors.size?.message} {...register("size")} />
            <Input label="Icon" name="icon" placeholder="Enter icon name or icon URL" error={errors.icon?.message} {...register("icon")} />
          </div>
        </section> */}

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div><h2 className="font-semibold text-slate-900">FAQs</h2><p className="mt-1 text-sm text-slate-500">Add questions and answers for this keyword page.</p></div>
            <Button type="button" variant="secondary" onClick={() => setFaqs((previous) => [...previous, emptyFaq()])}><Plus size={17} /> Add FAQ</Button>
          </div>
          <div className="space-y-5 p-5">
            {faqs.map((faq, index) => (
              <div key={index} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-900">FAQ {index + 1}</p>{faqs.length > 1 && <button type="button" onClick={() => setFaqs((previous) => previous.filter((_, i) => i !== index))} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={`Remove FAQ ${index + 1}`}><Trash2 size={16} /></button>}</div>
                <Input label="Question" placeholder="Enter question" value={faq.question} onChange={(event) => updateFaq(index, "question", event.target.value)} />
                <Textarea label="Answer" placeholder="Enter answer" rows={4} value={faq.answer} onChange={(event) => updateFaq(index, "answer", event.target.value)} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-slate-900">SEO Settings</h2><p className="mt-1 text-sm text-slate-500">Configure search engine metadata.</p></div>
          <div className="space-y-5 p-5">
            <Input label="Meta Title" name="metaTitle" placeholder="Enter SEO title" error={errors.metaTitle?.message} {...register("metaTitle")} />
            <Textarea label="Meta Description" name="metaDescription" placeholder="Enter SEO description" rows={4} error={errors.metaDescription?.message} {...register("metaDescription")} />
            <Textarea label="Meta Keywords" name="metaKeywords" placeholder="keyword 1, keyword 2, keyword 3" rows={3} error={errors.metaKeywords?.message} {...register("metaKeywords")} />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-slate-900">Keyword Images</h2><p className="mt-1 text-sm text-slate-500">Upload one main image and up to 10 additional images.</p></div>
          <div className="space-y-6 p-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Main Image</label>
              {mainImagePreview ? (
                <div className="relative h-48 w-48 overflow-hidden rounded-xl border border-slate-200">
                  <img src={mainImagePreview} alt="Keyword main" className="h-full w-full object-cover" />
                  <button type="button" onClick={removeMainImage} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-600 shadow" aria-label="Remove main image"><X size={17} /></button>
                  <label className="absolute inset-x-0 bottom-0 cursor-pointer bg-black/60 py-2 text-center text-xs text-white">Replace image<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleMainImage} /></label>
                </div>
              ) : (
                <label className="flex h-48 w-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50">
                  <ImagePlus size={32} className="text-slate-400" /><span className="mt-2 text-sm font-medium text-slate-600">Choose image</span><span className="mt-1 text-xs text-slate-400">JPG, PNG, WEBP</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleMainImage} />
                </label>
              )}
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between"><label className="text-sm font-medium text-slate-700">Additional Images</label><span className="text-xs text-slate-400">{existingImages.length + newImages.length}/10</span></div>
              <div className="flex flex-wrap gap-4">
                {existingImages.map((image, index) => (
                  <div key={`${image.original}-${index}`} className="relative h-28 w-28 overflow-hidden rounded-lg border border-slate-200">
                    <img src={image.url} alt={`Existing keyword ${index + 1}`} className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removeExistingImage(index)} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-600 shadow" aria-label="Remove existing image"><X size={14} /></button>
                  </div>
                ))}
                {newImagePreviews.map((preview, index) => (
                  <div key={preview} className="relative h-28 w-28 overflow-hidden rounded-lg border border-slate-200">
                    <img src={preview} alt={`New keyword ${index + 1}`} className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removeNewImage(index)} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-600 shadow" aria-label="Remove new image"><X size={14} /></button>
                  </div>
                ))}
                {existingImages.length + newImages.length < 10 && (
                  <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50">
                    <ImagePlus size={24} className="text-slate-400" /><span className="mt-1 text-xs text-slate-500">Add images</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleAdditionalImages} />
                  </label>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-slate-900">Keyword Settings</h2></div>
          <div className="p-5">
            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4">
              <span><span className="block text-sm font-medium text-slate-900">Active Keyword</span><span className="mt-1 block text-xs text-slate-500">Customers can see this keyword page when active.</span></span>
              <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            </label>
          </div>
        </section>

        <div className="sticky bottom-0 z-30 -mx-4 flex flex-col-reverse justify-end gap-3 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:flex-row sm:px-6">
          <Button type="button" variant="secondary" disabled={isSubmitting} onClick={() => navigate("/admin/keywords")}>Cancel</Button>
          <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>{isSubmitting ? "Saving..." : isEdit ? "Update Keyword" : "Create Keyword"}</Button>
        </div>
      </form>
    </div>
  );
}

export default KeywordForm;
