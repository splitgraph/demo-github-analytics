import { useRouter, type NextRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import { useEffect, useReducer } from "react";
export type GitHubRepository = { namespace: string; repository: string };

type ExportTable = {
  destinationSchema: string;
  destinationTable: string;
  taskId: string;
  sourceQuery?: string;
};

export type StepperState = {
  stepperState:
    | "uninitialized"
    | "unstarted"
    | "awaiting_import"
    | "import_complete"
    | "awaiting_export"
    | "export_complete";
  repository?: GitHubRepository | null;
  importTaskId?: string | null;
  importError?: string;
  splitgraphRepository?: string;
  splitgraphNamespace?: string;
  exportedTablesLoading?: Set<ExportTable>;
  exportedTablesCompleted?: Set<ExportTable>;
  exportError?: string;
};

export type StepperAction =
  | {
      type: "start_import";
      repository: GitHubRepository;
      taskId: string;
      splitgraphRepository: string;
      splitgraphNamespace: string;
    }
  | { type: "import_complete" }
  | { type: "start_export"; tables: ExportTable[] }
  | { type: "export_table_task_complete"; completedTable: ExportTable }
  | { type: "export_complete" }
  | { type: "export_error"; error: string }
  | { type: "import_error"; error: string }
  | { type: "reset" }
  | { type: "initialize_from_url"; parsedFromUrl: StepperState };

const initialState: StepperState = {
  stepperState: "unstarted",
  repository: null,
  splitgraphRepository: null,
  splitgraphNamespace: null,
  importTaskId: null,
  exportedTablesLoading: new Set<ExportTable>(),
  exportedTablesCompleted: new Set<ExportTable>(),
  importError: null,
  exportError: null,
};

const getQueryParamAsString = <T extends string = string>(
  query: ParsedUrlQuery,
  key: string
): T | null => {
  if (Array.isArray(query[key]) && query[key].length > 0) {
    throw new Error(`expected only one query param but got multiple: ${key}`);
  }

  if (!(key in query)) {
    return null;
  }

  return query[key] as T;
};

const queryParamParsers: {
  [K in keyof StepperState]: (query: ParsedUrlQuery) => StepperState[K];
} = {
  stepperState: (query) =>
    getQueryParamAsString<StepperState["stepperState"]>(
      query,
      "stepperState"
    ) ?? "unstarted",
  repository: (query) => ({
    namespace: getQueryParamAsString(query, "githubNamespace"),
    repository: getQueryParamAsString(query, "githubRepository"),
  }),
  importTaskId: (query) => getQueryParamAsString(query, "importTaskId"),
  importError: (query) => getQueryParamAsString(query, "importError"),
  exportError: (query) => getQueryParamAsString(query, "exportError"),
  splitgraphNamespace: (query) =>
    getQueryParamAsString(query, "splitgraphNamespace"),
  splitgraphRepository: (query) =>
    getQueryParamAsString(query, "splitgraphRepository"),
};

const requireKeys = <T extends Record<string, unknown>>(
  obj: T,
  requiredKeys: (keyof T)[]
) => {
  const missingKeys = requiredKeys.filter(
    (requiredKey) => !(requiredKey in obj)
  );

  if (missingKeys.length > 0) {
    throw new Error("missing required keys: " + missingKeys.join(", "));
  }
};

const stepperStateValidators: {
  [K in StepperState["stepperState"]]: (stateFromQuery: StepperState) => void;
} = {
  uninitialized: () => {},
  unstarted: () => {},
  awaiting_import: (stateFromQuery) =>
    requireKeys(stateFromQuery, [
      "repository",
      "importTaskId",
      "splitgraphNamespace",
      "splitgraphRepository",
    ]),
  import_complete: (stateFromQuery) =>
    requireKeys(stateFromQuery, [
      "repository",
      "splitgraphNamespace",
      "splitgraphRepository",
    ]),
  awaiting_export: (stateFromQuery) =>
    requireKeys(stateFromQuery, [
      "repository",
      "splitgraphNamespace",
      "splitgraphRepository",
    ]),
  export_complete: (stateFromQuery) =>
    requireKeys(stateFromQuery, [
      "repository",
      "splitgraphNamespace",
      "splitgraphRepository",
    ]),
};

const parseStateFromRouter = (router: NextRouter): StepperState => {
  const { query } = router;

  const stepperState = queryParamParsers.stepperState(query);

  const stepper = {
    stepperState: stepperState,
    repository: queryParamParsers.repository(query),
    importTaskId: queryParamParsers.importTaskId(query),
    importError: queryParamParsers.importError(query),
    exportError: queryParamParsers.exportError(query),
    splitgraphNamespace: queryParamParsers.splitgraphNamespace(query),
    splitgraphRepository: queryParamParsers.splitgraphRepository(query),
  };

  void stepperStateValidators[stepperState](stepper);

  return stepper;
};

const serializeStateToQueryParams = (stepper: StepperState) => {
  return JSON.parse(
    JSON.stringify({
      stepperState: stepper.stepperState,
      githubNamespace: stepper.repository?.namespace ?? undefined,
      githubRepository: stepper.repository?.repository ?? undefined,
      importTaskId: stepper.importTaskId ?? undefined,
      importError: stepper.importError ?? undefined,
      exportError: stepper.exportError ?? undefined,
      splitgraphNamespace: stepper.splitgraphNamespace ?? undefined,
      splitgraphRepository: stepper.splitgraphRepository ?? undefined,
    })
  );
};

const stepperReducer = (
  state: StepperState,
  action: StepperAction
): StepperState => {
  switch (action.type) {
    case "start_import":
      return {
        ...state,
        stepperState: "awaiting_import",
        repository: action.repository,
        importTaskId: action.taskId,
        splitgraphNamespace: action.splitgraphNamespace,
        splitgraphRepository: action.splitgraphRepository,
      };
    case "import_complete":
      return {
        ...state,
        stepperState: "import_complete",
      };
    case "start_export":
      const { tables } = action;
      const exportedTablesLoading = new Set<ExportTable>();
      const exportedTablesCompleted = new Set<ExportTable>();

      for (const {
        destinationTable,
        destinationSchema,
        sourceQuery,
        taskId,
      } of tables) {
        exportedTablesLoading.add({
          destinationTable,
          destinationSchema,
          sourceQuery,
          taskId,
        });
      }

      return {
        ...state,
        exportedTablesLoading,
        exportedTablesCompleted,
        stepperState: "awaiting_export",
      };

    case "export_table_task_complete":
      const { completedTable } = action;

      // We're storing a set of completedTable objects, so we need to find the matching one to remove it
      const loadingTablesAfterRemoval = new Set(state.exportedTablesLoading);
      const loadingTabletoRemove = Array.from(loadingTablesAfterRemoval).find(
        ({ taskId }) => taskId === completedTable.taskId
      );
      loadingTablesAfterRemoval.delete(loadingTabletoRemove);

      // Then we can add the matching one to the completed table
      const completedTablesAfterAdded = new Set(state.exportedTablesCompleted);
      completedTablesAfterAdded.add(completedTable);

      return {
        ...state,
        exportedTablesLoading: loadingTablesAfterRemoval,
        exportedTablesCompleted: completedTablesAfterAdded,
        stepperState:
          loadingTablesAfterRemoval.size === 0
            ? "export_complete"
            : "awaiting_export",
      };

    case "export_complete":
      return {
        ...state,
        stepperState: "export_complete",
      };
    case "import_error":
      return {
        ...state,
        splitgraphRepository: null,
        splitgraphNamespace: null,
        importTaskId: null,
        stepperState: "unstarted",
        importError: action.error,
      };
    case "export_error":
      return {
        ...state,
        exportedTablesLoading: new Set<ExportTable>(),
        exportedTablesCompleted: new Set<ExportTable>(),
        stepperState: "import_complete",
        exportError: action.error,
      };

    case "reset":
      return initialState;

    case "initialize_from_url":
      return {
        ...state,
        ...action.parsedFromUrl,
      };

    default:
      return state;
  }
};

const urlNeedsChange = (state: StepperState, router: NextRouter) => {
  const parsedFromUrl = parseStateFromRouter(router);

  return (
    state.stepperState !== parsedFromUrl.stepperState ||
    state.repository?.namespace !== parsedFromUrl.repository?.namespace ||
    state.repository?.repository !== parsedFromUrl.repository?.repository ||
    state.importTaskId !== parsedFromUrl.importTaskId ||
    state.splitgraphNamespace !== parsedFromUrl.splitgraphNamespace ||
    state.splitgraphRepository !== parsedFromUrl.splitgraphRepository
  );
};

/**
 * When the export has completed, send a request to /api/mark-import-export-complete
 * which will insert the repository into the metadata table, which we query to
 * render the sidebar
 */
const useMarkAsComplete = (
  state: StepperState,
  dispatch: React.Dispatch<StepperAction>
) => {
  useEffect(() => {
    if (state.stepperState !== "export_complete") {
      return;
    }

    const {
      repository: {
        namespace: githubSourceNamespace,
        repository: githubSourceRepository,
      },
      splitgraphRepository: splitgraphDestinationRepository,
    } = state;

    // NOTE: Make sure to abort request so that in React 18 development mode,
    // when effect runs twice, the second request is aborted and we don't have
    // a race condition with two requests inserting into the table (where we have no transactional
    // integrity and manually do a SELECT before the INSERT to check if the row already exists)
    const abortController = new AbortController();

    const markImportExportComplete = async () => {
      try {
        const response = await fetch("/api/mark-import-export-complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            githubSourceNamespace,
            githubSourceRepository,
            splitgraphDestinationRepository,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to mark import/export as complete");
        }

        const data = await response.json();

        if (!data.status) {
          throw new Error(
            "Got unexpected resposne shape when marking import/export complete"
          );
        }

        if (data.error) {
          throw new Error(
            `Failed to mark import/export complete: ${data.error}`
          );
        }

        console.log("Marked import/export as complete");
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        dispatch({
          type: "export_error",
          error: error.message ?? error.toString(),
        });
      }
    };

    markImportExportComplete();

    return () => abortController.abort();
  }, [state, dispatch]);
};

export const useStepperReducer = () => {
  const router = useRouter();
  const [state, dispatch] = useReducer(stepperReducer, {
    ...initialState,
    stepperState: "uninitialized",
  });

  useMarkAsComplete(state, dispatch);

  useEffect(() => {
    dispatch({
      type: "initialize_from_url",
      parsedFromUrl: parseStateFromRouter(router),
    });
  }, [router.query]);

  useEffect(() => {
    if (!urlNeedsChange(state, router)) {
      return;
    }

    if (state.stepperState === "uninitialized") {
      return;
    }

    console.log("push", {
      pathname: router.pathname,
      query: serializeStateToQueryParams(state),
    });
    router.push(
      {
        pathname: router.pathname,
        query: serializeStateToQueryParams(state),
      },
      undefined,
      { shallow: true }
    );
  }, [state.stepperState]);

  return [state, dispatch] as const;
};
