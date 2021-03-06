import React from "react";
import { rem } from "polished";
import { FaHamburger } from "react-icons/fa";
import { MdClose } from "react-icons/md";

import { bemed } from "react-bemed";
import { css } from "react-bemed/css";
import { Menu } from "./Menu";
import { Colors, Vars } from "./core";
import { MenuFooter } from "./MenuFooter";
import { useScrollLock } from "./hooks";
import Link from "next/link";
import { useRouter } from "../pages/_app";

const MENU_WIDTH = rem(280);

const Blk = bemed({
    css: css`
        min-height: 100vh;
    `,
    elements: {
        MobileHeader: bemed({
            as: "h1",
            css: css`
                margin: 0;
                padding-top: ${rem(20)};
                padding-bottom: ${rem(20)};
                padding-left: ${rem(30)};
                height: ${50};
                background-color: ${Colors.black};
                display: none;
                @media (${Vars.isMobile}) {
                    display: flex;
                }
                a {
                    color: ${Colors.menuTitle};
                    text-decoration: none;
                }
            `,
        }),
        MenuContainer: bemed({
            css: css`
                width: ${MENU_WIDTH};
                background-color: ${Colors.black};
                justify-content: space-between;
                overflow: auto;
                position: fixed;
                left: 0;
                top: 0;
                bottom: 0;
                display: none;
                @media (${Vars.isDesktop}) {
                    display: flex;
                }
            `,
            mods: {
                showMobile: css`
                    @media (${Vars.isMobile}) {
                        display: flex;
                        top: 0;
                        right: 0;
                        left: 0;
                        bottom: 0;
                        width: 100%;
                    }
                `,
            },
        }),
        MenuFooterContainer: bemed({
            css: css`
                margin-top: ${rem(50)};
                height: ${rem(100)};
            `,
        }),
        ContentWrap: bemed({
            css: css`
                @media (${Vars.isDesktop}) {
                    padding-left: ${MENU_WIDTH};
                }
                width: 100%;
            `,
        }),
        Content: bemed({
            css: css`
                padding-left: ${rem(30)};
                padding-right: ${rem(30)};
                padding-bottom: ${rem(100)};
                max-width: ${rem(800)};
            `,
        }),
        MenuButton: bemed({
            as: "button",
            defaultProps: {
                type: "button",
            },
            css: css`
                position: fixed;
                bottom: ${rem(30)};
                right: ${rem(30)};
                height: ${rem(50)};
                width: ${rem(50)};

                cursor: pointer;
                background-color: ${Colors.black};
                border-style: none;
                border-radius: ${rem(50)};
                color: white;
                align-items: center;
                justify-content: center;
                box-shadow: 0px 0px 10px 3px gray;

                display: none;
                @media (${Vars.isMobile}) {
                    display: flex;
                }
            `,
            mods: {
                isOpen: css`
                    background-color: white;
                    svg {
                        color: ${Colors.black};
                    }
                `,
            },
        }),
    },
})("Layout");

const GithubEditLink = bemed({
    as: "a",
    css: css`
        position: absolute;
        top: ${rem(15)};
        right: ${rem(15)};
        display: none;
        font-size: 10pt;
        @media (${Vars.isDesktop}) {
            display: flex;
        }
        &,
        &:visited {
            color: ${Colors.menuTitle};
        }
    `,
})("GithubEditLink");

function Github() {
    const router = useRouter();
    const page = router.asPath.slice(1);

    if (!page) {
        return null;
    }
    const editURL = `https://github.com/epeli/react-bemed/edit/master/docs/pages/${page}.mdx`;
    return <GithubEditLink href={editURL}>Edit on Github</GithubEditLink>;
}

export function Layout(props: { children: React.ReactNode }) {
    const [isMobileMenuVisible, setMobileMenuVisible] = React.useState(false);
    const toggleMenu = () => setMobileMenuVisible(visible => !visible);
    useScrollLock(isMobileMenuVisible);

    React.useEffect(() => {
        function listener(e: any) {
            if (e.target.tagName === "A") {
                setMobileMenuVisible(false);
            }
        }

        window.addEventListener("click", listener, false);
        return () => {
            window.removeEventListener("click", listener);
        };
    }, []);

    return (
        <Blk>
            <Blk.ContentWrap>
                <Blk.MobileHeader>
                    <Link passHref href="/">
                        <a>BEMed Components</a>
                    </Link>
                </Blk.MobileHeader>
                <Blk.Content>{props.children}</Blk.Content>
            </Blk.ContentWrap>

            <Blk.MenuContainer showMobile={isMobileMenuVisible}>
                <Menu />
                <Blk.MenuFooterContainer>
                    <MenuFooter />
                </Blk.MenuFooterContainer>
            </Blk.MenuContainer>

            <Blk.MenuButton onClick={toggleMenu} isOpen={isMobileMenuVisible}>
                {isMobileMenuVisible ? (
                    <MdClose size={25} />
                ) : (
                    <FaHamburger size={25} />
                )}
            </Blk.MenuButton>
            <Github />
        </Blk>
    );
}
