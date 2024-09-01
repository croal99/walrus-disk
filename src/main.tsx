import React from "react";
import ReactDOM from "react-dom/client";
import {
    createBrowserRouter, redirect,
    RouterProvider,
} from "react-router-dom";
import {Theme} from '@radix-ui/themes';

import ErrorPage from "@/layout/ErrorPage.tsx";
import Layout, {loader as rootLoader} from "@/layout/layout.tsx";
import LoginForm, {action as loginAction} from "@/components/user/LoginForm.tsx";
import Home from "@/components/home/home.tsx";
import Explorer, {loader as explorerLoader, action as createAction} from "@/components/home/explorer.tsx";

import '@radix-ui/themes/styles.css';
import "@/styles/globals.css";

import {apiAuthProvider} from "@/hooks/useAuthStatus.ts";

console.log(import.meta.env);

const router = createBrowserRouter([
        {
            id: "root",
            path: "/",
            Component: Layout,
            errorElement: <ErrorPage/>,
            loader: rootLoader,

            children: [
                {
                    path: "home",
                    index: true,
                    Component: Home,
                },
                {
                    path: "folder/:id",
                    element: <Explorer/>,
                    loader: explorerLoader,
                    action: createAction,
                },
            ],
        },
        {
            path: "/login",
            Component: LoginForm,
            action: loginAction,
        },
        {
            path: "/logout",
            loader: async () => {
                await apiAuthProvider.signout();
                return redirect("/");
            },
        },
    ]
);


ReactDOM.createRoot(document.getElementById("root")!).render(
    // <React.StrictMode>
    <Theme
        appearance="light"
        accentColor="grass"
    >
        <RouterProvider router={router}/>

    </Theme>
    // </React.StrictMode>
);
