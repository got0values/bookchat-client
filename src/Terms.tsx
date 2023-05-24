import React from "react";
import { 
  Text,
  Box,
  Flex,
  Image,
  Stack,
  Heading,
  Link,
  UnorderedList,
  ListItem,
  useColorMode,
  OrderedList
} from "@chakra-ui/react";
import logo from './assets/BookChatNoirLogoBlack.png';
import logoWhite from './assets/BookChatNoirLogoWhite.png';

const Terms = () => {
  const {colorMode} = useColorMode()

  return (
    <Flex
      justify={'center'}
      p={5}
    >
      <Stack>
        <Link
          href="/register"
          display="flex"
          justifyContent="center"
          mb={2}
        >
          <Image 
            src={colorMode === "light" ? logo : logoWhite} 
            maxH="75px"
          />
        </Link>
        <Stack 
          spacing={3} 
          maxW={'2xl'}
          p={4}
          backgroundColor="white"
          boxShadow="base"
          rounded="sm"
          className="well"
        >
          <Heading as="h1" size="lg" textAlign="center">
            Terms of Service
          </Heading>
          <Text>
            The Book Chat Noir Product enables people to connect with each other and build communities. These Terms govern your use of Book Chat Noir.
          </Text>
          <Text>
            We don't charge you to use Book Chat Noir. Instead, we get commissions for purchases made through links to products and/or get paid to show you ads. As an Amazon Associate, we earn from qualifying purchases. By using Book Chat Noir, you agree that we can show you ads that we think may be relevant to you and your interests. Protecting people's privacy is central to how we've designed our ad system. We don't sell your personal data.
          </Text>
          <Heading as="h2" size="md">
            Your commitments to Book Chat Noir and our community
          </Heading>
          <Text>
            We provide our service to you and others to help advance our mission. In exchange, we need you to make the following commitments:
          </Text>
          <Text fontWeight="bold">
            1. Who can use Book Chat Noir
          </Text>
          <Text>
            When people stand behind their opinions and actions, our community is safer and more accountable. For this reason, you must:
          </Text>
          <Box pl={3}>
            <UnorderedList spacing={2}>
              <ListItem>
                Provide for your account the same name that you use in everyday life.
              </ListItem>
              <ListItem>
                Provide accurate information about yourself.
              </ListItem>
              <ListItem>
                Create only one account (your own) and use it for personal purposes.
              </ListItem>
              <ListItem>
                Not share your password, give access to your Book Chat Noir account to others, or transfer your account to anyone else (without our permission).
              </ListItem>
            </UnorderedList>
          </Box>
          <Text>
            We try to make Book Chat Noir broadly available to everyone, but you cannot use Book Chat Noir if:
          </Text>
          <Box pl={3}>
            <UnorderedList spacing={2}>
              <ListItem>
                You are a convicted sex offender.
              </ListItem>
              <ListItem>
                We've previously disabled your account for violations of our Terms or other terms and policies that apply to your use of Book Chat Noir. If we disable your account for a violation of our Terms or other terms and policies, you agree not to create another account without our permission. Receiving permission to create a new account is provided at our sole discretion, and does not mean or imply that the disciplinary action was wrong or without cause.
              </ListItem>
              <ListItem>
                You are prohibited from receiving our product under applicable laws.
              </ListItem>
            </UnorderedList>
          </Box>
          <Text fontWeight="bold">
            2. What you can share and do on Book Chat Noir Products
          </Text>
          <Text>
            We want people to use Book Chat Noir Products to express themselves and to share content that is important to them, but not at the expense of the safety and well-being of others or the integrity of the community. You therefore agree not to engage in the conduct described below (or to facilitate or support others in doing so):
          </Text>
          <Text>
            You may not use our Product to do or share anything:
          </Text>
          <Text>
            That violates these Terms, the Community Standards, or other terms and policies that apply to your use of our Products.
          </Text>
          <Text>
            That is unlawful, misleading, discriminatory or fraudulent (or assists someone else in using our Products in such a way).
          </Text>
          <Text>
            That infringes or violates someone else's rights, including their intellectual property rights (such as by infringing another's copyright or trademark, or distributing or selling counterfeit or pirated goods), unless an exception or limitation applies under applicable law.
          </Text>
          <Text>
            You may not upload viruses or malicious code, use the services to send spam, or do anything else that could disable, overburden, interfere with, or impair the proper working, integrity, operation, or appearance of our services, systemes, or Product.
          </Text>
          <Text>
            You may not access or collect data from our Product using automated means (without our prior permission) or attempt to access data you do not have permission to access.
          </Text>
          <Text>
            You may not proxy, request, or collect Product usernames or passwords, or misappropriate access tokens.
            You may not sell, license, or purchase any data obtained from us or our services, except as provided in the Platform Terms.
          </Text>
          <Text>
            We can remove or restrict access to content that is in violation of these provisions. We can also suspend or disable your account for conduct that violates these provisions.
          </Text>
          <Text>
            To help support our community, we encourage you to report content or conduct that you believe violates your rights (including intellectual property rights) or our terms and policies to admin@bookchat.com, if this feature exists in your jurisdiction.
          </Text>
          <Text>
            We also can remove or restrict access to content features, services, or information if we determine that doing so is reasonably necessary to avoid or mitigate misuse of our services or adverse legal or regulatory impacts to Book Chat Noir.
          </Text>
          <Heading as="h2" size="md">
            Additional provisions
          </Heading>
          <Text fontWeight="bold">
            1. Updating our Terms
          </Text>
          <Text>
            We work constantly to improve our services and develop new features to make our Product better for you and our community. As a result, we may need to update these Terms from time to time to accurately reflect our services and practices, to promote a safe and secure experience on our Products and services, and/or to comply with applicable law. Unless otherwise required by law, we will notify you before we make changes to these Terms and give you an opportunity to review them before they go into effect. Once any updated Terms are in effect, you will be bound by them if you continue to use our Product.
          </Text>
          <Text>
            We hope that you will continue using our Product, but if you do not agree to our updated Terms and no longer want to be a part of the Book Chat Noir community, you can delete your account at any time.
          </Text>
          <Text fontWeight="bold">
            2. Account suspension or termination
          </Text>
          <Text>
            We want Book Chat Noir to be a place where people feel welcome and safe to express themselves and share their thoughts and ideas.
          </Text>
          <Text>
            If we determine, in our discretion, that you have clearly, seriously or repeatedly breached our Terms or Policies, we may suspend or permanently disable your access to Book Chat Noir, and we may permanently disable or delete your account. We may also disable or delete your account where we are required to do so for legal reasons.
          </Text>
          <Text>
            We may disable or delete your account if after registration your account is not confirmed, your account is unused and remains inactive for an extended period of time, or if we detect someone may have used it without your permission and we are unable to confirm your ownership of the account.
          </Text>
          <Text>
            Where we take such action we'll let you know and explain any options you have to request a review, unless doing so may expose us or others to legal liability; harm our community of users; compromise or interfere with the integrity or operation of any of our services, systems or Product; where we are restricted due to technical limitations; or where we are prohibited from doing so for legal reasons.
          </Text>
          <Text>
            If you delete or we disable or delete your account, these Terms shall terminate as an agreement between you and us.
          </Text>
          <Text fontWeight="bold">
            3. Limits on liability
          </Text>
          <Text>
            We work hard to provide the best Products we can and to specify clear guidelines for everyone who uses them. Our Products, however, are provided "as is," and we make no guarantees that they always will be safe, secure, or error-free, or that they will function without disruptions, delays, or imperfections. To the extent permitted by law, we also DISCLAIM ALL WARRANTIES, WHETHER EXPRESS OR IMPLIED, INCLUDING THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. We do not control or direct what people and others do or say, and we are not responsible for their actions or conduct (whether online or offline) or any content they share (including offensive, inappropriate, obscene, unlawful, and other objectionable content).
          </Text>
          <Text>
            We cannot predict when issues might arise with our Products. Accordingly, our liability shall be limited to the fullest extent permitted by applicable law, and under no circumstance will we be liable to you for any lost information, or data, or consequential, special, indirect, exemplary, punitive, or incidental damages arising out of or related to these Terms or the Book Chat Noir Product (however caused and on any theory of liability, including negligence), even if we have been advised of the possibility of such damages.
          </Text>
          <Text fontWeight="bold">
            4. Other
          </Text>
          <Box pl={3}>
            <OrderedList>
              <ListItem>
                <Text>
                  These Terms make up the entire agreement between you and Book Chat Noir regarding your use of our Product. They supersede any prior agreements.
                </Text>
              </ListItem>
              <ListItem>
                <Text>
                  If any portion of these Terms is found to be unenforceable, the unenforceable portion will be deemed amended to the minimum extent necessary to make it enforceable, and if it can't be made enforceable, then it will be severed and the remaining portion will remain in full force and effect. If we fail to enforce any of these Terms, it will not be considered a waiver. Any amendment to or waiver of these Terms must be made in writing and signed by us.
                </Text>
              </ListItem>
              <ListItem>
                <Text>
                  You will not transfer any of your rights or obligations under these Terms to anyone else without our consent.
                </Text>
                <Text>
                  These Terms do not confer any third-party beneficiary rights. All of our rights and obligations under these Terms are freely assignable by us in connection with a merger, acquisition, or sale of assets, or by operation of law or otherwise.
                </Text>
              </ListItem>
              <ListItem>
                <Text>
                  We may need to change the username for your account in certain circumstances (for example, if someone else claims the username and it appears unrelated to the name you use in everyday life).
                </Text>
              </ListItem>
              <ListItem>
                <Text>
                  We reserve all rights not expressly granted to you.
                </Text>
              </ListItem>
            </OrderedList>
          </Box>
        </Stack>
      </Stack>
    </Flex>
  );
};

export default Terms;
