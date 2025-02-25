export const modulePath = (name: "research" | "admin", path: string) => {
  if (!path.startsWith("/")) {
    throw new Error(
      `path "${path}" of module "${name}" is not starting with a "/"`,
    );
  }

  return `/module/${name}${path}`;
};
