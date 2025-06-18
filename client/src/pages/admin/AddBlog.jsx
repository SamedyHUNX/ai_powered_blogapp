import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import { assets, blogCategories } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { parse } from "marked";

const AddBlog = () => {
  const { axios } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const [image, setImage] = useState(false);
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [category, setCategory] = useState("Startup");
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setImage(false);
    setTitle("");
    setSubTitle("");
    setCategory("Startup");
    setIsPublished(false);
    if (quillRef.current) {
      quillRef.current.root.innerHTML = "";
    }
  };

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      setIsAdding(true);

      // Validation
      if (!image) {
        toast.error("Please upload a thumbnail image");
        return;
      }

      const description = quillRef.current.root.innerHTML;
      if (!description || description.trim() === "<p><br></p>") {
        toast.error("Please add blog description");
        return;
      }

      const blog = {
        title,
        subTitle,
        description,
        category,
        isPublished,
      };

      const formData = new FormData();
      formData.append("blog", JSON.stringify(blog));
      formData.append("image", image);

      const { data } = await axios.post("/api/blog/add", formData);

      if (data.success) {
        toast.success(data.message);
        resetForm();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error adding blog:", error);
      toast.error(
        error.response?.data?.message || error.message || "Failed to add blog"
      );
    } finally {
      setIsAdding(false);
    }
  };

  const generateContent = async () => {
    if (!title) return toast.error("Please enter a title");

    try {
      setLoading(true);
      const { data } = await axios.post("/api/blog/generate", {
        prompt: title,
      });

      if (data.success) {
        quillRef.current.root.innerHTML = parse(data.content);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Write your blog content here...",
      });
    }
  }, []);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex-1 bg-blue-50/50 text-gray-600 h-full overflow-scroll"
    >
      <div className="bg-white w-full max-w-3xl p-4 md:p-10 sm:m-10 shadow rounded">
        <p className="text-sm font-medium">Upload thumbnail</p>
        <label htmlFor="image">
          <img
            src={!image ? assets.upload_area : URL.createObjectURL(image)}
            alt="Upload thumbnail"
            className="mt-2 h-16 rounded cursor-pointer hover:opacity-80 transition-opacity"
          />
          <input
            onChange={(e) => setImage(e.target.files[0])}
            type="file"
            id="image"
            accept="image/*"
            hidden
          />
        </label>

        <p className="mt-4 text-sm font-medium">Blog Title</p>
        <input
          type="text"
          required
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          placeholder="Enter blog title"
          className="w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded focus:border-blue-500 transition-colors"
        />

        <p className="mt-4 text-sm font-medium">Sub Title</p>
        <input
          type="text"
          required
          onChange={(e) => setSubTitle(e.target.value)}
          value={subTitle}
          placeholder="Enter sub title"
          className="w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded focus:border-blue-500 transition-colors"
        />

        <p className="mt-4 text-sm font-medium">Blog Description</p>
        <div className="max-w-lg h-74 pb-16 sm:pb-10 pt-2 relative">
          <div ref={editorRef} className="min-h-[200px]"></div>
          {loading && (
            <div className="absolute right-0 top-0 bottom-0 left-0 flex items-center justify-center bg-black/10 mt-2">
              <div className="w-8 h-8 rounded-full border-2 border-t-white animate-spin"></div>
            </div>
          )}
          <button
            disabled={loading}
            className="absolute bottom-1 right-2 ml-2 text-xs text-white bg-black/70 px-4 py-1.5 rounded hover:bg-black/80 transition-colors cursor-pointer"
            type="button"
            onClick={generateContent}
          >
            Generate with AI
          </button>
        </div>

        <p className="mt-4 text-sm font-medium">Blog Category</p>
        <select
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-2 px-3 py-2 border text-gray-500 border-gray-300 outline-none rounded focus:border-blue-500 transition-colors"
        >
          {blogCategories.map((item, index) => (
            <option value={item} key={index}>
              {item}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            id="publish"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="scale-125 cursor-pointer"
          />
          <label
            htmlFor="publish"
            className="text-sm font-medium cursor-pointer"
          >
            Publish Now
          </label>
        </div>

        <button
          disabled={isAdding}
          type="submit"
          className="mt-8 w-40 h-10 bg-primary text-white rounded cursor-pointer text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAdding ? "Adding..." : "Add Blog"}
        </button>
      </div>
    </form>
  );
};

export default AddBlog;
