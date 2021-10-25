import { format, isAfter } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

format(new Date(), "'Hoje é' eeee", {
  locale: ptBR,
});

const formatDate = (firstDate: string, lastDate: string): string => {
  const edited = isAfter(new Date(lastDate), new Date(firstDate));

  if (edited) {
    return format(new Date(lastDate), "'*editado em' dd MMM yyyy, 'às' HH:mm", {
      locale: ptBR,
    });
  }

  return format(new Date(firstDate), 'dd MMM yyyy', {
    locale: ptBR,
  });
};

export default formatDate;
