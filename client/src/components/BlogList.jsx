import { useState } from "react";
import { blogCategories } from "../assets/assets";
import { motion } from "motion/react";
import BlogCard from "./BlogCard";
import { useAppContext } from "../context/AppContext";

const BlogList = () => {
  const [menu, setMenu] = useState("All");
  const { blogs, input } = useAppContext();

  // ✅ Fixed: Made it a variable instead of function, fixed typo
  const filteredBlogs =
    input === ""
      ? blogs
      : blogs.filter(
          (blog) =>
            blog.title.toLowerCase().includes(input.toLowerCase()) ||
            blog.category.toLowerCase().includes(input.toLowerCase()) // ✅ Fixed: "includes" not "include"
        );

  const handleSetMenu = (item) => {
    setMenu(item);
  };

  return (
    <>
      <div className="flex justify-center gap-4 sm:gap-8 my-10 relative">
        {/* --- blog categories --- */}
        {blogCategories.map((item) => (
          <div key={item} className="relative">
            <button
              onClick={() => handleSetMenu(item)}
              className={`cursor-pointer text-gray-500 ${
                menu === item && "text-white px-4 pt-0.5"
              }`}
            >
              {item}
              {menu === item && (
                <motion.div
                  layoutId="underline"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute left-0 right-0 top-0 h-7 -z-10 bg-primary rounded-full"
                ></motion.div>
              )}
            </button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 mb-24 mx-8 sm:mx-16 xl:mx-40">
        {filteredBlogs
          .filter((blog) => (menu === "All" ? true : blog.category === menu))
          .map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
      </div>
    </>
  );
};

export default BlogList;
