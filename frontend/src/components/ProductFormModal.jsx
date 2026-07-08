import React, { useEffect, useRef, useState } from "react";
import { FaImage, FaPlus, FaUpload } from "react-icons/fa";

const EMPTY_PRODUCT = {
  name: "",
  category: "",
  newCategory: "",
  price: "",
  offerPrice: "",
  description: "",
  badge: "Normal",
  status: "Available",
  customizedAvailable: false,
  featured: false,
  hasVariants: false,
  variants: {
    classic: { enabled: false, price: "", description: "" },
    premium: { enabled: false, price: "", description: "" },
    luxury: { enabled: false, price: "", description: "" },
  },
  image: null,
  preview: null,
};

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ProductFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isDarkMode,
  categories = [],
}) => {
  const inputRef = useRef(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setErrors({});
    setForm(
      initialData
        ? {
            name: initialData.name || "",
            category: initialData.category || "",
            newCategory: "",
            price: initialData.price ?? "",
            offerPrice: initialData.offerPrice ?? "",
            description: initialData.description || "",
            badge: initialData.badge || "Normal",
            status: initialData.status || "Available",
            customizedAvailable: Boolean(initialData.customizedAvailable),
            featured: Boolean(initialData.featured),
            hasVariants: Boolean(initialData.hasVariants),
            variants: initialData.variants || {
              classic: { enabled: false, price: "", description: "" },
              premium: { enabled: false, price: "", description: "" },
              luxury: { enabled: false, price: "", description: "" },
            },
            image: null,
            preview: initialData.image || null,
          }
        : { ...EMPTY_PRODUCT }
    );
  }, [isOpen, initialData]);

  useEffect(
    () => () => {
      if (form.preview?.startsWith("blob:")) URL.revokeObjectURL(form.preview);
    },
    [form.preview]
  );

  if (!isOpen) return null;

  const setField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleVariantChange = (variant, field, value) => {
    setForm(current => ({
      ...current,
      variants: {
        ...current.variants,
        [variant]: {
          ...current.variants[variant],
          [field]: value
        }
      }
    }));
  };

  const normalizedCategories = categories.length
    ? categories
    : [{ value: "bridal", label: "Bridal" }, { value: "bouquet", label: "Bouquet" }];

  const applyFile = (file) => {
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrors((current) => ({ ...current, image: "Only JPG, PNG, and WEBP images are allowed" }));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((current) => ({ ...current, image: "Image must be 5MB or smaller" }));
      return;
    }

    setErrors((current) => ({ ...current, image: undefined }));
    setForm((current) => ({
      ...current,
      image: file,
      preview: URL.createObjectURL(file),
    }));
  };

  const handleFileChange = (event) => applyFile(event.target.files?.[0]);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    applyFile(event.dataTransfer.files?.[0]);
  };

  const resolvedCategory = form.category === "__new__" ? form.newCategory.trim() : form.category;

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Product name is required";
    if (!resolvedCategory) next.category = "Category is required";
    if (!form.price || Number(form.price) <= 0) next.price = "Enter a valid price greater than zero";
    if (form.badge === "Offer") {
      if (!form.offerPrice || Number(form.offerPrice) <= 0) next.offerPrice = "Offer price is required";
      else if (Number(form.offerPrice) >= Number(form.price)) {
        next.offerPrice = "Offer price must be less than the original price";
      }
    }
    if (!initialData && !form.image) next.image = "Product image is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      await onSubmit({
        ...form,
        category: resolvedCategory,
        offerPrice: form.badge === "Offer" ? form.offerPrice : "",
      });
      onClose();
    } catch (error) {
      const apiErrors = error.response?.data?.details || error.response?.data?.errors || {};
      setErrors((current) => ({ ...current, ...apiErrors }));
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = (field) =>
    `w-full rounded-xl border bg-white dark:bg-gray-800 px-3 py-2.5 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-950 ${
      errors[field] ? "border-red-500" : isDarkMode ? "border-gray-600 text-white" : "border-gray-300"
    }`;

  const ErrorText = ({ field }) => (errors[field] ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p> : null);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6"
      onClick={() => !isSaving && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        className={`max-h-[94vh] w-full max-w-4xl animate-scaleIn overflow-y-auto rounded-3xl shadow-2xl ${
          isDarkMode ? "border border-gray-700 bg-gray-800" : "bg-white"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`sticky top-0 z-10 flex items-center justify-between border-b px-5 py-4 backdrop-blur ${
            isDarkMode ? "border-gray-700 bg-gray-800/95" : "border-gray-200 bg-white/95"
          }`}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-500">Admin Gallery</p>
            <h2 id="product-form-title" className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {initialData ? "Edit Product" : "Add Product"}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            disabled={isSaving}
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={submit} noValidate className="space-y-5 p-5 sm:p-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Product Image {!initialData && "*"}
            </label>
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`rounded-2xl border-2 border-dashed p-4 transition ${
                isDragging
                  ? "border-rose-500 bg-rose-50/40 dark:bg-rose-950/20"
                  : errors.image
                  ? "border-red-400"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="h-36 w-full overflow-hidden rounded-xl bg-gray-100 sm:w-44 dark:bg-gray-700">
                  {form.preview ? (
                    <img src={form.preview} alt="Product preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      <FaImage className="text-4xl" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Drag & drop an image here</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">JPG, PNG or WEBP. Maximum 5MB.</p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 font-semibold text-white hover:bg-rose-700"
                    >
                      <FaUpload /> Upload Image
                    </button>
                    {form.preview && (
                      <button
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, image: null, preview: initialData?.image || null }))}
                        className="rounded-xl border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        Reset Image
                      </button>
                    )}
                  </div>

                  <input
                    ref={inputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <ErrorText field="image" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold dark:text-gray-200">Product Name *</label>
              <input value={form.name} onChange={(e) => setField("name", e.target.value)} className={inputClass("name")} />
              <ErrorText field="name" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold dark:text-gray-200">Category *</label>
              <select value={form.category} onChange={(e) => setField("category", e.target.value)} className={inputClass("category")}>
                <option value="">Select category</option>
                {normalizedCategories.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
                <option value="__new__">Add New Category</option>
              </select>
              <ErrorText field="category" />
            </div>

            {form.category === "__new__" && (
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-semibold dark:text-gray-200">New Category Name</label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      value={form.newCategory}
                      onChange={(e) => setField("newCategory", e.target.value)}
                      className={inputClass("category")}
                      placeholder="Example: Stage Decor"
                    />
                  </div>
                  <div className="inline-flex items-center rounded-xl bg-emerald-100 px-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <FaPlus className="mr-2" /> New
                  </div>
                </div>
                <ErrorText field="category" />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-semibold dark:text-gray-200">Price (₹) *</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
                className={inputClass("price")}
              />
              <ErrorText field="price" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold dark:text-gray-200">Product Status</label>
              <select value={form.badge} onChange={(e) => setField("badge", e.target.value)} className={inputClass("badge")}>
                <option value="Normal">Normal</option>
                <option value="New Arrival">New Arrival</option>
                <option value="Offer">Offer</option>
              </select>
              <ErrorText field="badge" />
            </div>

            {form.badge === "Offer" && (
              <div>
                <label className="mb-1 block text-sm font-semibold dark:text-gray-200">Offer Price (₹) *</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.offerPrice}
                  onChange={(e) => setField("offerPrice", e.target.value)}
                  className={inputClass("offerPrice")}
                />
                <ErrorText field="offerPrice" />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-semibold dark:text-gray-200">Availability</label>
              <select value={form.status} onChange={(e) => setField("status", e.target.value)} className={inputClass("status")}>
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
              </select>
              <ErrorText field="status" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold dark:text-gray-200">Product Description</label>
            <textarea
              rows="4"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              className={`${inputClass("description")} resize-none`}
            />
          </div>

          <div className="space-y-4 rounded-2xl bg-gray-50 p-4 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-rose-600 dark:text-rose-400">
              <input
                type="checkbox"
                checked={form.hasVariants}
                onChange={(e) => setField("hasVariants", e.target.checked)}
                className="h-5 w-5 accent-rose-600"
              />
              Enable Product Variants (Classic, Premium, Luxury)
            </label>

            {form.hasVariants && (
              <div className="space-y-5 pt-3 border-t border-gray-200 dark:border-gray-700">
                {["classic", "premium", "luxury"].map((variant) => (
                  <div key={variant} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <label className="flex cursor-pointer items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={form.variants[variant].enabled}
                        onChange={(e) => handleVariantChange(variant, "enabled", e.target.checked)}
                        className="h-4 w-4 accent-rose-600"
                      />
                      <h4 className="font-bold capitalize text-gray-800 dark:text-gray-100">{variant} Variant</h4>
                    </label>
                    
                    {form.variants[variant].enabled && (
                      <div className="grid sm:grid-cols-3 gap-4 pl-6 border-l-2 border-rose-100 dark:border-rose-900/30 ml-2 mt-2">
                        <div className="col-span-3 sm:col-span-1">
                          <label className="mb-1 block text-xs font-semibold dark:text-gray-300">Price (₹) *</label>
                          <input
                            type="number"
                            min="0"
                            value={form.variants[variant].price}
                            onChange={(e) => handleVariantChange(variant, "price", e.target.value)}
                            className={inputClass("variant_" + variant)}
                            placeholder="e.g. 500"
                          />
                        </div>
                        <div className="col-span-3 sm:col-span-2">
                          <label className="mb-1 block text-xs font-semibold dark:text-gray-300">Description</label>
                          <textarea
                            rows="2"
                            value={form.variants[variant].description}
                            onChange={(e) => handleVariantChange(variant, "description", e.target.value)}
                            className={`${inputClass("variant_" + variant)} resize-none`}
                            placeholder={`Describe what makes the ${variant} variant unique...`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-3 rounded-2xl bg-gray-50 p-4 sm:grid-cols-2 dark:bg-gray-700/50">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold dark:text-gray-200">
              <input
                type="checkbox"
                checked={form.customizedAvailable}
                onChange={(e) => setField("customizedAvailable", e.target.checked)}
                className="h-5 w-5 accent-rose-600"
              />
              Customized Available
            </label>
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold dark:text-gray-200">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setField("featured", e.target.checked)}
                className="h-5 w-5 accent-rose-600"
              />
              Featured Product
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t pt-5 dark:border-gray-700">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex min-w-36 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 font-semibold text-white shadow-lg hover:bg-rose-700 disabled:cursor-wait disabled:opacity-70"
            >
              {isSaving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {initialData ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
