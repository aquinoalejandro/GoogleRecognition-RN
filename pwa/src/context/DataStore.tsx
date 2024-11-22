let dataStore: any[] = [];

export const saveData = (data: any) => {
  dataStore.push(data);
  console.log('Datos guardados:', dataStore);
};
