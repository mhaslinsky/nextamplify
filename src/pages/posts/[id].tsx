import { Amplify, API, withSSRContext } from "aws-amplify";
import Head from "next/head";
import { useRouter } from "next/router";
import awsExports from "@/aws-exports";
import { deletePost } from "@/graphql/mutations";
import { getPost } from "@/graphql/queries";
// import styles from "../../styles/Home.module.css";
import { GetPostQuery, Post } from "@/API";

Amplify.configure({ ...awsExports, ssr: true });

export async function getServerSideProps({ req, params }: { req: any; params: any }) {
  const SSR = withSSRContext({ req });
  const response = (await SSR.API.graphql({
    query: getPost,
    variables: {
      id: params.id,
    },
  })) as Promise<{ data: GetPostQuery }>;

  return {
    props: {
      post: (await response).data.getPost,
    },
  };
}

export default function Post({ post }: { post: Post }) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div>
        <h1>Loading&hellip;</h1>
      </div>
    );
  }

  async function handleDelete() {
    try {
      await API.graphql({
        authMode: "AMAZON_COGNITO_USER_POOLS",
        query: deletePost,
        variables: {
          input: { id: post.id },
        },
      });

      router.push("/");
    } catch (error) {
      if (typeof error === "object" && error !== null && "errors" in error) {
        const graphQLError = error as { errors: { message: string }[] };
        console.error(...graphQLError.errors);
        throw new Error(...graphQLError.errors[0].message);
      } else {
        console.error(error);
        throw error; // or throw a new error with a generic message
      }
    }
  }

  return (
    <div className='h-full'>
      <Head>
        <title>{post.title} – Amplify + Next.js</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='grid place-content-center h-full'>
        <h1>{post.title}</h1>

        <p>{post.content}</p>

        <button onClick={handleDelete}>💥 Delete post</button>
      </div>
    </div>
  );
}
