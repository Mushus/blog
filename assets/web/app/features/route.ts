import uri from "uri-tag";

export const Route = {
  createPost: "/admin/post/create",
  editPost: (postId: string) => uri`/admin/posts/${postId}`,
  registerUser: "/admin/users/register",
  editUser: (userId: string) => uri`/admin/users/${userId}`,
  listImage: "/admin/images",
  uploadImage: "/admin/images",
  admin: "/admin",
  login: "/admin/login",
  logout: "/admin/logout",
  post: (postId: string) => uri`/posts/${postId}`,
  user: (userId: string) => uri`/users/${userId}`,
  home: "/",
};

export const BreadCrumb = {
  createPost: { text: "Home", href: Route.home },
  editPost: (postId: string) => ({
    text: "Post",
    href: Route.editPost(postId),
  }),
  registerUser: { text: "Register User", href: Route.registerUser },
  editUser: (userId: string) => ({
    text: "Edit User",
    href: Route.editUser(userId),
  }),
  admin: { text: "Home", href: Route.admin },
  login: { text: "Login", href: Route.login },
  post: (postId: string) => ({ text: "Post", href: Route.post(postId) }),
  user: (userId: string) => ({ text: "User", href: Route.user(userId) }),
  home: { text: "Home", href: Route.home },
};
