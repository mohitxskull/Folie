# What is *Folie*?

*Folie* is a comprehensive suite of TypeScript npm packages designed to streamline the development of type-safe APIs and rich user interfaces. It provides a cohesive ecosystem of tools and pre-built components that work together seamlessly, allowing developers to quickly build robust and maintainable web applications. *Folie* aims to significantly reduce boilerplate code, improve developer productivity, and enhance the overall user experience.

## Use Cases

*Folie* is particularly well-suited for projects that require:

*   **Data-driven applications:** The `cobalt` package provides powerful data table and form components, along with hooks for efficient data fetching, making it ideal for applications that heavily rely on displaying and manipulating data.
*   **Rapid prototyping:** The pre-built UI components and streamlined API integration facilitate rapid prototyping and iteration, allowing developers to quickly bring their ideas to life.
*   **Type-safe APIs:** The combination of `castle`, `blueprint`, and `gate` ensures end-to-end type safety, from the backend API to the frontend UI, reducing the risk of runtime errors and improving code maintainability.
*   **AdonisJS backends:** The `castle` package is specifically designed to work with AdonisJS, providing a robust foundation for building backend APIs that seamlessly integrate with the *Folie* ecosystem.
*   **Enhanced security and UX:** The `squid` package offers a unique approach to handling database IDs, improving both security and user experience by converting integer IDs to human-readable strings.

## Developer Experience

*Folie* prioritizes developer experience by providing:

*   **Pre-built UI components:** The `cobalt` and `cobalt-animation` packages offer a rich set of ready-to-use UI components, reducing the need for custom UI development.
*   **Type-safe API interactions:** The `blueprint` and `gate` packages ensure type safety across the entire application, making development more predictable and reducing debugging time.
*   **Streamlined data fetching:** The `cobalt` package provides hooks for simplified and type-safe data fetching from the backend.
*   **Centralized error handling:** The `castle` package offers centralized error handling on the backend, simplifying error management and improving code maintainability.
*   **Clear documentation:** Each package within the *Folie* suite is well-documented, providing developers with the information they need to quickly get started and effectively use the tools.
*   **Seamless Integration:** The packages are designed to work together harmoniously, minimizing integration effort and maximizing development efficiency.

## Typesafety

Typesafety is a core principle of *Folie*. The suite achieves comprehensive typesafety through the following mechanisms:

*   **TypeScript:** All *Folie* packages are written in TypeScript, ensuring static type checking and improving code quality.
*   **Schema generation:** The `blueprint` package generates a schema from the backend API, which is then used by the `cobalt` and `gate` packages to enforce type safety during API interactions.
*   **End-to-end type checking:** The combination of `castle`, `blueprint`, and `gate` provides end-to-end type checking, from the backend API to the frontend UI, minimizing the risk of runtime errors and improving code maintainability.
*   **Type-safe data fetching:** The `cobalt` package provides type-safe hooks for fetching data from the backend, ensuring that data is handled correctly throughout the application.