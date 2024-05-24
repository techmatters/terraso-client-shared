import { SharedState } from 'terraso-client-shared/store/store';

export const selectSoilIdData = () => (state: SharedState) =>
  state.soilId.soilIdData;

export const selectSoilIdInput = () => (state: SharedState) =>
  state.soilId.soilIdParams;

export const selectSoilIdStatus = () => (state: SharedState) =>
  state.soilId.soilIdStatus;
