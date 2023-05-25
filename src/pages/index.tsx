// pages/index.js
import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify, API, Auth, withSSRContext } from "aws-amplify";
import Head from "next/head";
import awsExports from "@/aws-exports";
import { createPost } from "@/graphql/mutations";
import { listPosts } from "@/graphql/queries";
import { useRouter } from "next/router";
import { CreatePostMutation, ListPostsQuery, Post } from "@/API";
import Form from "../components/Form";
import { useState } from "react";

//Amplify.configure: This part is setting up AWS Amplify with the appropriate configuration
//(provided by 'aws-exports') for server-side rendering (SSR). The 'ssr: true' configuration is
//necessary for credentials to be available during authenticated server-side requests.
Amplify.configure({ ...awsExports, ssr: true });

export async function getServerSideProps({ req }: any) {
  //creating a server-side copy of Amplify (named 'SSR' from 'withSSRContext({ req })')
  //that is used to make GraphQL queries and manage credentials, storage, and data for a single request.
  //using this 'SSR' object to fetch a list of posts from the API
  const SSR = withSSRContext({ req });

  try {
    const response = await (SSR.API.graphql({
      query: listPosts,
      authMode: "API_KEY",
    }) as Promise<{ data: ListPostsQuery }>);

    return {
      props: {
        posts: response.data.listPosts?.items,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {},
    };
  }
}

export default function Home({ posts = [] }: { posts: Post[] }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");

  async function handleCreatePost(e: any) {
    e.preventDefault();

    try {
      const response = (await API.graphql({
        authMode: "AMAZON_COGNITO_USER_POOLS",
        query: createPost,
        variables: {
          input: {
            title,
            content,
          },
        },
      })) as Promise<{ data: CreatePostMutation }>;
      router.push(`/posts/${(await response).data.createPost?.id}`);
    } catch (error) {
      if (typeof error === "object" && error !== null && "errors" in error) {
        const graphQLError = error as { errors: { message: string }[] };
        console.error(...graphQLError.errors);
      } else {
        console.error(error);
      }
    }
  }

  return (
    <div className='flex flex-1 justify-center h-full '>
      <Head>
        <title>Amplify + Next.js</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main>
        <Authenticator>
          <h3 className='text-xl'>New Post</h3>
          <form onSubmit={handleCreatePost}>
            <Form
              contentValue={content}
              onChangeContent={(e) => setContent(e.target.value)}
              onChangeTitle={(e) => setTitle(e.target.value)}
              titleValue={title}
            />
            <div className='flex flex-row justify-between pb-2'>
              <button onClick={handleCreatePost} className='btn btn-primary'>
                Create Post
              </button>
              <button type='button' onClick={() => Auth.signOut()} className='btn btn-primary '>
                Sign Out
              </button>
            </div>
          </form>

          {posts.map((post) => (
            <div key={post.id} className='card w-96 bg-base-100 shadow-xl mb-2'>
              <div className='card-body'>
                <div className='card-actions justify-end'></div>
                <a href={`/posts/${post.id}`}>
                  <h5 className='mb-2 text-xl font-medium leading-tight text-neutral-800 dark:text-neutral-50'>
                    {post.title}
                  </h5>
                  <p className='mb-4 text-base text-slate-100 dark:text-neutral-200'>{post.content}</p>
                </a>
              </div>
            </div>
          ))}
        </Authenticator>
      </main>
    </div>
  );
}
