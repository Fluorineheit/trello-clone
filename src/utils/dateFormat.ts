export function dateFormat(date: Date, mode: 'd-m' | 'd-m-y' = 'd-m-y'): string {

  const day = date.getDate();
  const month = date.toLocaleDateString('default', { month: 'long' });
  const year = date.getFullYear();
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if(mode === 'd-m') {
    return `${day} ${month}`;
  }

  return `${day} ${month} ${year}, ${time}`;
}
