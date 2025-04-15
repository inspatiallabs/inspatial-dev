"use client";

import * as React from "react";
// import { button } from "../../ornament/button";
import { motion, AnimatePresence } from "motion/react";
import { useLocation, Link } from "react-router";
// import Logo from "../../../primitives/logo";
import { HeaderWidgetVariant, headerWidgetVariants } from "./variant.ts";
import { kit } from "@inspatial/theme/variant";

const CaretDownIcon = ({
  isOpen,
  isCurrentPage,
  isHovered,
}: {
  isOpen: boolean;
  isCurrentPage: boolean;
  isHovered: boolean;
}) => (
  <svg
    width="10"
    height="6"
    viewBox="0 0 10 6"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${
      isCurrentPage || isHovered ? "stroke-green" : "stroke-brand"
    } inline-block`}
    style={{
      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 0.3s ease, stroke 0.3s ease",
    }}
  >
    <path
      d="M1 1L5 5L9 1"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface MegaMenuItem {
  title: string;
  route: string;
}

interface MegaMenu {
  display?: boolean;
  border?: boolean;
  routes: MegaMenuItem[];
}

interface MenuItem {
  title: string;
  route: string;
  hasMegaMenu: boolean;
  megaMenu?: MegaMenu;
}

interface HeaderWidgetProps extends HeaderWidgetVariant {
  menuItems?: MenuItem[];
  className?: string;
  variant?: string;
}

export function HeaderWidget(props: HeaderWidgetProps) {
  /**************************************************(VARIANT PROP)**************************************************/
  const {
    menuItems,
    className = "",
    settings,
    // variant,
    // base,
    // composition,
    // defaultSettings,
    // hooks,
  } = props || {};

  const variantClass = headerWidgetVariants.useVariant({
    variant: "full",
    ...settings,
  });

  /**************************************************(STATE)**************************************************/

  const [isMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  const [hoveredMenu, setHoveredMenu] = React.useState<string | null>(null);
  const megaMenuRef = React.useRef<HTMLDivElement>(null);
  const currentPath = useLocation().pathname;

  const MenuItems = React.useMemo(
    () =>
      menuItems || [
        { title: "Home", route: "/", hasMegaMenu: false },
        {
          title: "Services",
          route: "#",
          hasMegaMenu: true,
          megaMenu: {
            display: true,
            border: true,
            routes: [
              { title: "Live Marketing", route: "/live-marketing" },
              { title: "Fan Zones", route: "/fan-zones" },
              { title: "Employee Engagement", route: "/employee-engagement" },
            ],
          },
        },
        {
          title: "Case Studies",
          route: "#",
          hasMegaMenu: true,
          megaMenu: {
            display: true,
            border: true,
            routes: [
              { title: "Meta Case Study", route: "/meta" },
              { title: "McDonald's Case Study", route: "/mc" },
              { title: "Nerf X Liv Golf Case Study", route: "/nerf-x-liv" },
            ],
          },
        },
        { title: "Approach", route: "/approach", hasMegaMenu: false },
        { title: "Studios", route: "/studios", hasMegaMenu: false },
        {
          title: "About Us",
          route: "#",
          hasMegaMenu: true,
          megaMenu: {
            display: true,
            border: true,
            routes: [
              { title: "Meet The Team", route: "/team" },
              { title: "Our Values", route: "/our-values" },
            ],
          },
        },
        { title: "Contact", route: "/contact", hasMegaMenu: false },
      ],
    [menuItems]
  );

  const containerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const menuLinkVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  const mobileMenuVariants = {
    closed: { opacity: 0, x: "100%" },
    open: { opacity: 1, x: 0 },
  };

  const megaMenuVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  const handleMenuEnter = (title: string) => {
    setActiveMenu(title);
  };

  const handleMenuLeave = () => {
    if (!megaMenuRef.current?.matches(":click")) {
      setActiveMenu(null);
    }
  };

  const handleMegaMenuLeave = () => {
    setActiveMenu(null);
  };

  const isCurrentPage = (menu: MenuItem) => {
    if (menu.route === currentPath) return true;
    if (menu.megaMenu) {
      return menu.megaMenu.routes.some(
        (subMenu) => subMenu.route === currentPath
      );
    }
    return false;
  };

  return (
    <>
      <motion.div
        className={kit(
          `flex border-b-2 border-b-(--brand) absolute z-[1] w-full h-[80px] bg-(--surface) px-24 xl:px-12`,
          className
        )}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.section
          className="flex w-auto h-auto items-center"
          variants={menuLinkVariants}
        >
          <Link to="/" className="flex w-full">
            Test Logo
            {/* <Logo className="flex w-fit fill-(--primary) justify-start hover:fill-(--brand)" /> */}
          </Link>
        </motion.section>

        <section className="flex w-full h-auto items-center justify-end md:hidden">
          {MenuItems.map((menu, index) => (
            <motion.div
              key={index}
              variants={menuLinkVariants}
              onMouseEnter={() => {
                handleMenuEnter(menu.title);
                setHoveredMenu(menu.title);
              }}
              onMouseLeave={() => {
                handleMenuLeave();
                setHoveredMenu(null);
              }}
              className="relative mx-4"
            >
              <button
                // asChild
                // variant="link"
                className={`uppercase hover:no-underline flex items-center ${
                  isCurrentPage(menu) || hoveredMenu === menu.title
                    ? "text-green"
                    : "text-brand"
                }`}
              >
                <Link to={menu.route} className="flex items-center">
                  {menu.title}
                  {menu.hasMegaMenu && (
                    <span className="ml-1 flex items-center">
                      <CaretDownIcon
                        isOpen={activeMenu === menu.title}
                        isCurrentPage={isCurrentPage(menu)}
                        isHovered={hoveredMenu === menu.title}
                      />
                    </span>
                  )}
                </Link>
              </button>
            </motion.div>
          ))}
        </section>

        <motion.button
          className="hidden md:flex items-center ml-auto"
          onClick={() => setIsMobileMenuOpen(!isMenuOpen)}
          variants={menuLinkVariants}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-brand"
          >
            <path
              d="M3 12H21"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 6H21"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 18H21"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
      </motion.div>

      {/* Full-width Mega Menu for desktop */}
      <AnimatePresence>
        {activeMenu &&
          MenuItems.find((item) => item.title === activeMenu)?.hasMegaMenu && (
            <motion.div
              ref={megaMenuRef}
              className={kit(variantClass, className)}
              variants={megaMenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onMouseLeave={handleMegaMenuLeave}
            >
              <section className="flex w-full h-auto items-center justify-center px-24 gap-3 bg-inherit mx-auto xl:px-12 py-8 overflow-hidden">
                <div
                  className="flex flex-col w-fit items-center overflow-hidden"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <h3 className="uppercase text-brand font-medium mb-4">
                    {activeMenu}
                  </h3>
                  <div className="flex flex-col items-center w-full">
                    {MenuItems.find(
                      (item) => item.title === activeMenu
                    )?.megaMenu?.routes.map((subMenu, subIndex) => (
                      <button
                        key={subIndex}
                        //   asChild
                        //   variant="link"
                        className={`uppercase hover:no-underline block mb-4 w-fit overflow-hidden ${
                          subMenu.route === currentPath
                            ? "text-green"
                            : "text-brand"
                        }`}
                      >
                        <Link to={subMenu.route}>{subMenu.title}</Link>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </motion.div>
          )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed top-0 right-0 w-full h-full bg-black/90 z-50 flex flex-col items-center justify-center"
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <motion.button
              className="absolute top-6 right-6"
              onClick={() => setIsMobileMenuOpen(false)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18"
                  stroke="#F44A9B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 6L18 18"
                  stroke="#F44A9B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>
            {MenuItems.map((menu, index) => (
              <motion.div
                key={index}
                variants={menuLinkVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                custom={index}
                className="w-full text-center overflow-hidden"
              >
                <button
                  //   asChild
                  //   variant="link"
                  className={`uppercase text-2xl my-4 flex items-center justify-center overflow-hidden ${
                    isCurrentPage(menu) ? "text-green" : "text-brand"
                  }`}
                  onClick={() => !menu.megaMenu && setIsMobileMenuOpen(false)}
                >
                  {menu.megaMenu ? (
                    <span
                      onClick={() =>
                        setActiveMenu(
                          activeMenu === menu.title ? null : menu.title
                        )
                      }
                      className="flex items-center justify-center"
                    >
                      {menu.title}
                      <span className="ml-2 flex items-center">
                        <CaretDownIcon
                          isOpen={activeMenu === menu.title}
                          isCurrentPage={isCurrentPage(menu)}
                          isHovered={hoveredMenu === menu.title}
                        />
                      </span>
                    </span>
                  ) : (
                    <Link
                      to={menu.route}
                      className="w-full flex justify-center"
                    >
                      {menu.title}
                    </Link>
                  )}
                </button>
                {menu.megaMenu && activeMenu === menu.title && (
                  <motion.div
                    className="mt-2 mb-4"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={megaMenuVariants}
                  >
                    {menu.megaMenu.routes.map((subMenu, subIndex) => (
                      <button
                        key={subIndex}
                        // asChild
                        // variant="link"
                        className={`block text-xl my-2 overflow-hidden ${
                          subMenu.route === currentPath
                            ? "text-green"
                            : "text-brand"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Link to={subMenu.route}>{subMenu.title}</Link>
                      </button>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
