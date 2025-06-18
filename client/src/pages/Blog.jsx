import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Moment from "moment";
import Loader from "../components/Loader";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Blog = () => {
  const { id } = useParams();
  const { axios } = useAppContext();

  const [data, setData] = useState(null);
  const [comments, setComments] = useState([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true); // Add explicit loading state
  const [error, setError] = useState(null); // Add error state

  const fetchBlogData = async () => {
    try {
      console.log("Fetching blog data for ID:", id); // Debug log
      const response = await axios.get(`/api/blog/${id}`);
      console.log("Blog API response:", response.data); // Debug log

      if (response.data.success) {
        setData(response.data.blog);
        setError(null);
      } else {
        toast.error(response.data.message);
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching blog data:", error); // Debug log
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch blog data";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false); // Always set loading to false
    }
  };

  const fetchComments = async () => {
    try {
      console.log("Fetching comments for blog ID:", id); // Debug log
      const response = await axios.post(`/api/blog/comments/${id}`);
      console.log("Comments API response:", response.data); // Debug log

      if (response.data.success) {
        setComments(response.data.comments);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching comments:", error); // Debug log
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch comments"
      );
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post("/api/blog/add-comment", {
        blog: id,
        name,
        content,
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setContent("");
        fetchComments(); // Refresh comments after adding
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error adding comment:", error); // Debug log
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to add comment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    console.log("useEffect triggered with ID:", id); // Debug log
    console.log("axios instance:", axios); // Debug log

    if (id && axios) {
      setLoading(true);
      setError(null);
      fetchBlogData();
      fetchComments();
    } else {
      console.error("Missing required dependencies:", { id, axios }); // Debug log
      setLoading(false);
      setError("Missing blog ID or axios instance");
    }
  }, [id, axios]); // Add axios to dependencies

  // Show error state
  if (error && !loading) {
    return (
      <div className="relative">
        <Navbar />
        <div className="text-center mt-20 text-red-600">
          <h1 className="text-2xl font-semibold mb-4">Error Loading Blog</h1>
          <p>{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchBlogData();
              fetchComments();
            }}
            className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Show loading state
  if (loading || !data) {
    return <Loader />;
  }

  // Main component render
  return (
    <div className="relative">
      <img
        src={assets.gradientBackground}
        alt=""
        className="absolute -top-[200px] -z-10 opacity-50"
      />
      <Navbar />
      <div className="text-center mt-20 text-gray-600">
        <p className="text-primary py-4 font-medium">
          Published on {Moment(data.createdAt).format("MMMM Do YYYY")}
        </p>
        <h1 className="text-2xl sm:text-5xl font-semibold max-w-2xl mx-auto text-gray-800">
          {data.title}
        </h1>
        <h2 className="text-center my-5 truncate mx-auto">{data.subTitle}</h2>
        <p className="inline-block py-1 px-4 rounded-full mb-6 border text-sm border-primary/35 bg-primary/5 font-medium text-primary">
          {data.author || "Anonymous"}
        </p>
      </div>

      <div className="mx-5 max-w-5xl md:mx-auto my-10 mt-6">
        <img src={data.image} alt={data.title} className="rounded-3xl mb-5" />
        <div
          className="rich-text max-w-3xl mx-auto"
          dangerouslySetInnerHTML={{ __html: data.description }}
        ></div>

        <div className="mt-14 mb-10 max-w-3xl mx-auto">
          <p className="font-semibold mb-4">Comments ({comments.length})</p>
          <div className="flex flex-col gap-4">
            {comments.map((item, index) => (
              <div
                key={item._id || index}
                className="relative bg-primary/2 border border-primary/5 max-w-xl p-4 rounded text-gray-600"
              >
                <div className="flex items-center gap-2 mb-2">
                  <img src={assets.user_icon} alt="User" className="w-6" />
                  <p className="font-medium">{item.name}</p>
                </div>
                <p className="text-sm max-w-md ml-8">{item.content}</p>
                <div className="absolute right-4 bottom-3 flex items-center gap-2 text-xs">
                  {Moment(item.createdAt).fromNow()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Comment Section */}
        <div className="max-w-3xl mx-auto">
          <p className="font-semibold mb-4">Add your comment</p>
          <form
            onSubmit={addComment}
            className="flex flex-col items-start gap-4 max-w-lg"
          >
            <input
              type="text"
              placeholder="Name"
              required
              onChange={(e) => setName(e.target.value)}
              value={name}
              disabled={isSubmitting}
              className="w-full p-2 border border-gray-300 rounded outline-none disabled:opacity-50"
            />

            <textarea
              placeholder="Comment"
              onChange={(e) => setContent(e.target.value)}
              value={content}
              disabled={isSubmitting}
              className="w-full p-2 border border-gray-300 rounded outline-none h-48 disabled:opacity-50"
              required
            ></textarea>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-white rounded p-2 px-8 hover:scale-102 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="my-24 max-w-3xl mx-auto">
        <p className="font-semibold my-4">
          Share this article on social media.
        </p>
        <div className="flex gap-2">
          <img src={assets.facebook_icon} width={50} alt="Share on Facebook" />
          <img src={assets.twitter_icon} width={50} alt="Share on Twitter" />
          <img src={assets.googleplus_icon} width={50} alt="Share on Google+" />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;
