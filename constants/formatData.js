export const formatarData = (data) => {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}`;
}