import { useNavigate } from "react-router-dom";

interface RedirectArgs {
  errorType?: string;
}

export const redirectToErrorPage = ({errorType}: RedirectArgs) => {
  const navigate = useNavigate();
  navigate(`/redirectpage?errortype=${errorType ? errorType : ""}`)
}