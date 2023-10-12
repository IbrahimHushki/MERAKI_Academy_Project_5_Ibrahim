import React from "react";
import openSocket from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import {
  GetAllPosts,
  GetCommentsByPost,
} from "../../Services/APIS/Posts/GetAllPosts";
import { setComments, setPosts } from "../../Services/Redux/Posts/index";
import { useEffect, useState } from "react";
import Loader from "../../components/Loader/Loader";
import { GetCategories } from "../../Services/APIS/Category/Get_Categories";
import { setCategories } from "../../Services/Redux/Category";
import { setSubCategories } from "../../Services/Redux/Sub_Categories";
import { setServices } from "../../Services/Redux/services";
import Categories from "../../components/Home_Categories/Categories";
import Sub_Categories from "../../components/Home_Categories/Sub_Categories";
import Pop_up from "../../components/Dialog_Modal/Pop-up";
import NewPost from "../../components/New_Post/NewPost";
import { getAllServices } from "../../Services/APIS/Services/Get_Services";
import Tabs from "../../components/Tabs/Tabs";
import Home_Page from "../../components/Home_Page_Post_&_Service/Home_Page";

const Home = () => {
  const dispatch = useDispatch();
  const limit = 2;
  const [offset, setOffset] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isCategoryClicked, setIsCategoryClicked] = useState(false);
  const [toggle, setToggle] = useState(true);

  const select = useSelector((state) => {
    return {
      post: state.post.post,
      comments: state.post.comments,
      categories: state.categories.categories,
      subCategories: state.subCategories.subCategories,
      services: state.services.services,
      service: state.services.service,
    };
  });

  let postComments = {};

  useEffect(() => {
    if (toggle) {
      GetAllPosts(limit, offset, 0, 0, 0)
        .then((res) => {
          dispatch(setPosts(res));
          res?.forEach((el) => {
            GetCommentsByPost(el.id)
              .then((comments) => {
                postComments[`post_${el?.id}`] = comments;
                dispatch(setComments(postComments));
              })
              .catch((err) => {});
          });
        })
        .catch((err) => {
          setError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      getAllServices(limit, offset, 0)
        .then((res) => {
          dispatch(setServices(res));
        })
        .catch((err) => {
          setError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [toggle]);

  useEffect(() => {
    GetCategories(0, 0, 0)
      .then((result) => {
        dispatch(setCategories(result));
      })
      .catch((err) => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const socket = openSocket("http://localhost:5000");
    socket.on("posts", (data) => {
      if (data.action === "create") {
        GetAllPosts(limit, offset, 0, 0, 0)
          .then((res) => {
            dispatch(setPosts(res));
            res?.forEach((el) => {
              GetCommentsByPost(el.id)
                .then((comments) => {
                  postComments[`post_${el?.id}`] = comments;
                  dispatch(setComments(postComments));
                })
                .catch((err) => {});
            });
          })
          .catch((err) => {
            setError(true);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    });
  }, []);

  const handlePage = (li, off) => {
    GetAllPosts(li, off, 0, 0, 0)
      .then((result) => {
        dispatch(setPosts(result));
        result?.forEach((el) => {
          GetCommentsByPost(el.id)
            .then((comments) => {
              postComments[`post_${el?.id}`] = comments;
              dispatch(setComments(postComments));
            })
            .catch((err) => {});
        });
        window.scrollTo({ top: 0 });
      })
      .catch((err) => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCloseModal = () => {
    setError(false);
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader />
        </div>
      ) : (
        <>
          {error ? (
            <>
              <Pop_up message={error} onClose={handleCloseModal} />
            </>
          ) : (
            <>
              <Categories
                categories={select?.categories?.categories}
                dispatch={dispatch}
                setIsCategoryClicked={setIsCategoryClicked}
                setSubCategories={setSubCategories}
                limit={limit}
                offset={offset}
                setPosts={setPosts}
                postComments={postComments}
                setComments={setComments}
                setLoading={setLoading}
                setError={setError}
              />

              {isCategoryClicked && (
                <Sub_Categories
                  subCategories={select?.subCategories}
                  GetCommentsByPost={GetCommentsByPost}
                  dispatch={dispatch}
                  postComments={postComments}
                  setComments={setComments}
                  setLoading={setLoading}
                  setPosts={setPosts}
                  limit={limit}
                  offset={offset}
                  setError={setError}
                />
              )}

              <Tabs setToggle={setToggle} />

              <NewPost
                toggle={toggle}
                isCategoryClicked={isCategoryClicked}
                dispatch={dispatch}
                setError={setError}
                setLoading={setLoading}
                
              />

              <Home_Page
                postsArray={select?.post}
                servicesArray={select?.services}
                toggle={toggle}
                commentsArray={select?.comments}
                dispatch={dispatch}
                postComments={postComments}
                setError={setError}
                setLoading={setLoading}
                handlePage={handlePage}
                limit={limit}
                offset={offset}
                setOffset={setOffset}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default Home;
