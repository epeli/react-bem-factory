import React from "react";
import Head from "next/head";

export function Title(props: { children: string }) {
    return (
        <Head>
            <title>{props.children} - BEMed Components</title>
        </Head>
    );
}
