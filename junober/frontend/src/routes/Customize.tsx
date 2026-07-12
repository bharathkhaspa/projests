import { useCustomizer } from "../store/customizer";
import { Scene } from "../customizer/Scene";
import { TopBar } from "../customizer/TopBar";
import { Toolbar } from "../customizer/Toolbar";
import { ViewToggle } from "../customizer/ViewToggle";
import { BottomSheet } from "../customizer/BottomSheet";
import { CartDrawer } from "../customizer/CartDrawer";
import { ProductPanel } from "../customizer/panels/ProductPanel";
import { ColorPanel } from "../customizer/panels/ColorPanel";
import { UploadPanel } from "../customizer/panels/UploadPanel";
import { PrintPanel } from "../customizer/panels/PrintPanel";
import { EffectsPanel } from "../customizer/panels/EffectsPanel";
import { BuyPanel } from "../customizer/panels/BuyPanel";

const TITLES: Record<string, string> = {
  product: "Product",
  color: "Colors",
  upload: "Upload Design",
  print: "Print Type",
  effects: "Effects",
  buy: "Add to Cart",
};

export default function Customize() {
  const activePanel = useCustomizer((s) => s.activePanel);
  const closePanel = useCustomizer((s) => s.closePanel);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        background: "#fff",
        fontFamily:
          'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <Scene />
      <TopBar />
      <ViewToggle />
      <Toolbar />
      <CartDrawer />

      <BottomSheet
        open={activePanel === "product"}
        title={TITLES.product}
        onClose={closePanel}
      >
        <ProductPanel />
      </BottomSheet>
      <BottomSheet
        open={activePanel === "color"}
        title={TITLES.color}
        onClose={closePanel}
      >
        <ColorPanel />
      </BottomSheet>
      <BottomSheet
        open={activePanel === "upload"}
        title={TITLES.upload}
        onClose={closePanel}
      >
        <UploadPanel />
      </BottomSheet>
      <BottomSheet
        open={activePanel === "print"}
        title={TITLES.print}
        onClose={closePanel}
      >
        <PrintPanel />
      </BottomSheet>
      <BottomSheet
        open={activePanel === "effects"}
        title={TITLES.effects}
        onClose={closePanel}
      >
        <EffectsPanel />
      </BottomSheet>
      <BottomSheet
        open={activePanel === "buy"}
        title={TITLES.buy}
        onClose={closePanel}
      >
        <BuyPanel />
      </BottomSheet>
    </div>
  );
}
