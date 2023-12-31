import { StepperContextProvider, useStepper } from "./StepperContext";
import { DebugPanel } from "./DebugPanel";
import { ImportPanel } from "./ImportPanel";
import { ExportPanel } from "./ExportPanel";

import styles from "./Stepper.module.css";
import { ChartsPanel } from "./ChartsPanel";

const StepperOrLoading = ({ children }: { children: React.ReactNode }) => {
  const [{ stepperState, debug }] = useStepper();

  return (
    <>
      {stepperState === "uninitialized" ? (
        <div>........</div>
      ) : (
        <>
          {debug && <DebugPanel />}
          {children}
        </>
      )}
    </>
  );
};

export const Stepper = () => {
  return (
    <StepperContextProvider>
      <div className={styles.stepper}>
        <StepperOrLoading>
          <ImportPanel />
          <ExportPanel />
          <ChartsPanel />
        </StepperOrLoading>
      </div>
    </StepperContextProvider>
  );
};
