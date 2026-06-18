import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  useGetMe,
  useUpdateMe,
  getGetMeQueryKey,
  useGetGridIntensities,
  getGetGridIntensitiesQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@clerk/react";
import {
  carbonMultiplier,
  waterMultiplier,
  getGrid,
  getWue,
  type GridRegion,
  type RegionWue,
} from "@/lib/grid-regions";

type GridContextValue = {
  gridId: string;
  grid: GridRegion;
  multiplier: number;
  /** Water multiplier for the attributed region's WUE (1.0 for fallback). */
  waterMultiplier: number;
  /** Water-usage effectiveness attributed to the selected region. */
  wue: RegionWue;
  /** Effective carbon intensity in use (live when available, else static). */
  intensityGPerKwh: number;
  source: "live" | "static";
  asOf: string | null;
  setGridId: (id: string) => void;
  isLoading: boolean;
};

const GridContext = createContext<GridContextValue>({
  gridId: "US_AVERAGE",
  grid: getGrid("US_AVERAGE"),
  multiplier: 1,
  waterMultiplier: 1,
  wue: getWue("US_AVERAGE"),
  intensityGPerKwh: getGrid("US_AVERAGE").intensityGPerKwh,
  source: "static",
  asOf: null,
  setGridId: () => {},
  isLoading: false,
});

export function GridProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  const { data: profile, isLoading } = useGetMe({
    query: { enabled: !!isSignedIn, queryKey: getGetMeQueryKey() },
  });
  const { mutate: updateMe } = useUpdateMe();
  const { data: intensities } = useGetGridIntensities({
    query: { queryKey: getGetGridIntensitiesQueryKey(), staleTime: 30 * 60 * 1000 },
  });
  const [gridId, setGridIdLocal] = useState("US_AVERAGE");

  useEffect(() => {
    if (profile?.gridRegion) {
      setGridIdLocal(profile.gridRegion);
    }
  }, [profile?.gridRegion]);

  const setGridId = useCallback(
    (id: string) => {
      setGridIdLocal(id);
      updateMe({ data: { gridRegion: id } });
    },
    [updateMe],
  );

  const grid = getGrid(gridId);
  const live = intensities?.find((i) => i.id === gridId);
  const intensityGPerKwh = live?.intensityGPerKwh ?? grid.intensityGPerKwh;
  const source = live?.source ?? "static";
  const asOf = live?.asOf ?? null;

  return (
    <GridContext.Provider
      value={{
        gridId,
        grid,
        multiplier: carbonMultiplier(gridId, intensityGPerKwh),
        waterMultiplier: waterMultiplier(gridId),
        wue: getWue(gridId),
        intensityGPerKwh,
        source,
        asOf,
        setGridId,
        isLoading,
      }}
    >
      {children}
    </GridContext.Provider>
  );
}

export function useGrid() {
  return useContext(GridContext);
}
