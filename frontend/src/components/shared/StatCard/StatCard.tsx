import { Card } from "../../ui/Card/Card";

interface Props{
    title: string;
    value: number | string;
    icon?: React.ReactNode;
}

export const StatCard = ({title, value, icon}: Props) => {
    return(
        <Card className="p-5 transition hover:shadow-md">
            <div className="flex items-center justify-between">
                <h3 className="text-sm text-muted-foreground">{title}</h3>

                {icon}
            </div>

            <p className="mt-3 text-3xl font-bold">{value}</p>
        </Card>
    );
};

export default StatCard;