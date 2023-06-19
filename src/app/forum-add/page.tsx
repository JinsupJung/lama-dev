"use client";
import "./quill.snow.css";
import "@uploadthing/react/styles.css";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai/index";
import { TiCancelOutline } from "react-icons/ti/index";
import dynamic from "next/dynamic";
import { useSession, signIn, signOut } from "next-auth/react";
import useSWR from "swr";
import { MultiSelect } from "@mantine/core";
import { AiFillFire } from "react-icons/ai";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "../api/uploadthing/core";
import { MouseEventHandler } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
  redirect,
  notFound,
} from "next/navigation";

const QuillWrapper = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
});

const modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["link"],
    ["clean"],
  ],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  },
};
/*
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
];

// useSWR용 fetcher
const fetcher = async (url: RequestInfo): Promise<any> => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

interface Tag {
  name: string;
}

// 게시판 글작성
export default function ForumAdd() {
  const { data: session, status } = useSession();
  //태그 데이터 가져오기
  const { data, error, isLoading } = useSWR("/api/tags", fetcher);
  // 태그 선택용
  const [getTags, setGetTags] = useState<{ value: string; label: string }[]>(
    []
  );
  // 새로운 테그 몽고db에 저장용
  const [getSavedTags, setGetSavedTags] = useState<{ name: string }[]>([]);
  // 사용자 선택 태그
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    category: "",
    tags: "",
  });
  const [content, setMd] = useState("<h1>이직을 준비하며 생긴 고민거리</h1>");
  // 이미지 선택 모달용
  const [showModal, setShowModal] = useState(false);
  const [showChooseFile, setShowChooseFile] = useState(true);
  const [images, setImages] = useState<
    {
      fileUrl: string;
      fileKey: string;
    }[]
  >([]);
  //저장후 라우팅을 위한 
  const router = useRouter();
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const [divClick, setDivClick] = useState(false);

  useEffect(() => {
    if (data) {
      // MultiSelect용 배열 만들기
      setGetSavedTags(data.data);
      let parsedTags = data.data.map((tag: Tag) => {
        return {
          value: tag.name,
          label: tag.name,
        };
      });
      setGetTags(parsedTags);
      console.log("parsedTags =", parsedTags);
    }
  }, [data]);

  // useSWR
  if (error) return <div>failed to load</div>;
  if (isLoading || !data)
    return (
      <div>
        loading...
        <button type="button" className="... bg-indigo-500" disabled>
          <svg
            className="... mr-3 h-5 w-5 animate-spin"
            viewBox="0 0 24 24"
          ></svg>
          Processing...
        </button>
      </div>
    );

  let createdBy = "";

  if (status === "authenticated") {
    createdBy = session?.user?.email ?? "";
  }
  // console.log(createdBy);

  const contentType = "application/json";
  const href = "/community";

  // 등록 - 몽고DB에 저장
  const onClick = async (req: any, res: any) => {
    console.log("getTags =", getTags);
    console.log("selectedTags =", selectedTags);
    // 받은 태그와 새로 입력된 태그 비교해서 추가된 태그만 몽고db에 저장
    const differenceArray = getTags.filter(
      (item1) => !getSavedTags.some((item2) => item1.value === item2.name)
    );

    const newArray = differenceArray.map((item) => ({ name: item.value }));

    try {
      // 포럼 데이터 처리
      let response = await fetch("/api/forums", {
        method: "POST",
        headers: {
          Accept: contentType,
          "Content-Type": contentType,
        },
        body: JSON.stringify({ ...form, content, createdBy }),
      });

      // 태그 데이터 처리
      response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          Accept: contentType,
          "Content-Type": contentType,
        },
        // body: JSON.stringify({ ...form }),
        body: JSON.stringify(newArray),
      });

      if (response.status >= 400) {
        return res.status(400).json({
          error: "There was an error",
        });
      }

      return res.status(200).json({ status: "ok" });
    } catch (error) {
      console.log(error);
    }

  };
  // 취소
  const onCancel = () => {

    console.log(content);
  };

  const handleAnchorClick = async (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    event.preventDefault();
    if (!divClick) {
    // Save your data logic here
    // ...
    await onClick(event.target, event);
    // Navigate to a different route
    router.push("/community");
    }
  };

  const handleDivClick = () => {
    setDivClick(true);
    if (anchorRef.current) {
      anchorRef.current.click();
    }
  };

  const titleUpload = images.length ? (
    <>
      <p>‣ Upload Complete!</p>
      <p className="mt-2 font-semibold">
        ‣ 업로드된 파일수: {images.length} files
      </p>
      <p className="mt-2 font-semibold">‣ 이미지 저장경로</p>
    </>
  ) : null;

  const imgList = (
    <>
      {/* {title} */}
      <ul className="pl-4">
        {images.map((image) => (
          <li key={image.fileUrl} className="mt-2">
            <Link href={image.fileUrl} target="_blank">
              {image.fileUrl}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
  const onModalCloseHandler = () => {
    setShowModal(false);
    setShowChooseFile(true);
  };

  return (
    <div>
      <section className="section-sm">
        <div className="container">
          <div className="row">
            <div className="mx-auto md:col-10">
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  className="form-input"
                  placeholder="제목을 입력해주세요"
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                />
              </div>

              <div className="mb-4">
                <label htmlFor="tags" className="form-label">
                  태그 <span className="text-red-500">*</span>
                </label>
                <MultiSelect
                  mb="sm"
                  data={getTags}
                  value={selectedTags}
                  onChange={setSelectedTags}
                  placeholder="Select or type categories"
                  searchable
                  creatable
                  getCreateLabel={(query) => `+ Create ${query}`}
                  onCreate={(query) => {
                    const item = { value: query, label: query };
                    setGetTags((current) => [...current, item]);
                    return item;
                  }}
                  maxSelectedValues={3}
                />
              </div>
              {/* <div className="mt-1 border border-slate-600"> */}
              <div className="mt-1">
                <label htmlFor="tags" className="form-label">
                  본문 <span className="text-red-500">*</span>
                </label>
                <QuillWrapper
                  // className="h-20"
                  theme={"snow"}
                  id={"description"}
                  placeholder={"내용을 입력해주세요"}
                  value={content}
                  modules={modules}
                  formats={formats}
                  onChange={setMd}
                  // onChange={(event) => setMd(event?.target.value)}
                />
              </div>

              <div className="mx-10 mt-3 flex justify-start">

    {/* 등록버튼 */}
                <Link href="/" passHref>
                  <div
                    className="ml-3 rounded bg-blue-500 px-6 py-3 text-blue-100 no-underline hover:bg-blue-600 hover:text-blue-200 hover:underline"
                    onClick={handleDivClick}
                  >
                    <a
                      ref={anchorRef}
                      onClick={handleAnchorClick}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-nowrap">
                        <AiOutlineCloudUpload size="26" color="#fff" />
                        <p className="ml-1">등록</p>
                      </div>
                    </a>
                  </div>
                </Link>
    {/* 등록버튼 */}

                <Link
                  href={href}
                  onClick={onCancel}
                  className="ml-2 rounded bg-blue-500 px-6 py-3 text-blue-100 no-underline hover:bg-blue-600 hover:text-blue-200 hover:underline"
                >
                  <div className="flex flex-nowrap">
                    <TiCancelOutline size="26" color="#fff" />
                    <p className="ml-1">취소</p>
                  </div>
                </Link>
                <button
                  className="flex h-12  items-center justify-center gap-2 rounded-md border border-blue-100 px-6 font-bold
                             text-gray-800 outline-none hover:bg-black hover:text-white hover:shadow-lg focus:outline-none active:bg-black"
                  type="button"
                  onClick={() => setShowModal(true)}
                >
                  <AiFillFire className="text-xl" />
                  Upload Images
                </button>
                {/* end - vanila modal */}
              </div>
            </div>
          </div>
          {showModal ? (
            <div
              className="absolute -bottom-10  ml-40   flex h-auto w-1/2 flex-col items-center justify-center rounded-lg bg-slate-200 p-3 shadow-xl"
              // onClick={onModalCloseHandler}
            >
              {/* <Image src={Gift} width={100} height={100} alt="modal" /> */}
              <h2 className="mx-4 mt-2 text-center text-base font-semibold text-gray-400">
                업로드할 이미지를 선택해주세요.
              </h2>
              <div className="flex gap-5">
                {/* <button
                  className="my-5 h-10 w-auto rounded-md bg-blue-600 px-8 font-semibold text-white shadow hover:shadow-lg"
                  onClick={() => setShowModal(false)}
                >
                  이미지 파일 선택
                </button>
                <button
                  className=" my-5 h-10 w-auto rounded-md border border-red-100 px-12 font-semibold   text-red-600 hover:bg-red-700  hover:text-white hover:shadow-lg"
                  onClick={() => setShowModal(false)}
                >
                  취소
                </button> */}
                {showChooseFile && (
                  <UploadButton<OurFileRouter>
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      if (res) {
                        setImages(res);
                        const json = JSON.stringify(res);
                        // Do something with the response
                        setShowChooseFile(false);
                        console.log(json);
                      }
                      //alert("Upload Completed");
                    }}
                    onUploadError={(error: Error) => {
                      // Do something with the error.
                      alert(`ERROR! ${error.message}`);
                    }}
                  />
                )}
                {!showChooseFile && (
                  <div className="flex-col">
                    <div>{titleUpload}</div>
                    <div>{imgList}</div>
                    <button
                      className="focus:shadow-outline mt-2 h-12 rounded-lg bg-indigo-400 px-4 py-2 text-lg font-bold text-indigo-100 transition-colors duration-150 hover:bg-indigo-500"
                      onClick={onModalCloseHandler}
                    >
                      닫기
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
